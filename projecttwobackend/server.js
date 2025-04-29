// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const session = require('express-session');
const axios = require('axios');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require('firebase-admin');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

const app = express();
const visionClient = new ImageAnnotatorClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const modelName = 'gemini-2.0-flash-exp-image-generation';
const { Logging } = require("@google-cloud/logging")



//Imports for logging/analytics
const { v4: uuidv4 } = require('uuid');

//Function to call for tacking google analytics
const clientId = uuidv4();
function trackEvent(eventName) {

  const GAMeasurementID = process.env.GA4_MEASUREMENT_ID;

  const GAAPIKey = process.env.GA4_API_KEY;

  try {
    const response = axios.post('https://www.google-analytics.com/mp/collect?measurement_id=G-YY6K33P76Q&api_secret=BILbgNTRQASDSBT1NFlXIw', {
      client_id: clientId,
      events: [{ name: eventName }],
    });
    console.log('Event sent:', response.data);
  } catch (error) {
    console.error('Error sending event:', error.response?.data || error.message);
  }

}



//Setup and Function call for google logging
const logging = new Logging();

const log = logging.log("gemini-api-requests");

// Usage: logRequest({ message: "string to log"})
async function logRequest(dataToLog) {
    const metadata = { resource: { type: "global" } };
    const entry = log.entry(metadata, dataToLog);
    await log.write(entry);
}

// === Firebase Setup ===
let serviceAccount;
try {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT;
  serviceAccount = require(serviceAccountPath);
} catch (error) {
  console.error('Error loading Firebase service account:', error);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
});

const db = getFirestore();
const bucket = getStorage().bucket();

// === Middleware ===
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['POST', 'GET','DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {
    sameSite: 'lax',
    secure: false
  }
}));

// === Proxy external images to avoid CORS issues ===
app.get('/api/proxy-image', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) {
      return res.status(400).send('Missing image URL');
    }
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    res.setHeader('Content-Type', response.headers['content-type']);
    res.send(response.data);
  } catch (error) {
    console.error('Image proxy error:', error);
    res.status(500).send('Failed to proxy image');
  }
});

// === Pinterest OAuth + Basic API ===
const { PINTEREST_APP_ID, PINTEREST_APP_SECRET, REDIRECT_URI } = process.env;

// Handles pintrest auth
app.get('/auth', (req, res) => {
  const state = Math.random().toString(36).substring(2);
  req.session.state = state;
  const authUrl =
    `https://www.pinterest.com/oauth/?` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `client_id=${PINTEREST_APP_ID}&` +
    `scope=pins:read,user_accounts:read,boards:read&` +
    `state=${state}&refreshable=true`;
  res.redirect(authUrl);
});

app.get('/auth/pinterest/callback', async (req, res) => {
  const { code, state } = req.query;
  if (state !== req.session.state) {
    return res.status(403).send('Invalid state');
  }
  try {
    const tokenRes = await axios.post(
      'https://api.pinterest.com/v5/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI
      }),
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${PINTEREST_APP_ID}:${PINTEREST_APP_SECRET}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    req.session.accessToken = tokenRes.data.access_token;
    // Where to go after auth
    res.redirect('http://localhost:5173/pins');
  } catch (err) {
    console.error('Token exchange error:', err.response?.data || err);
    res.status(500).send('Failed to get access token');
  }
});

// Displays users pintrest pins
app.get('/api/pins', async (req, res) => {
  const token = req.session.accessToken;
  // If pintrest auth went wrong for some reason
  if (!token) {
    return res.status(401).send('Not authenticated');
  }
  try {
    const [pinsRes, userRes] = await Promise.all([
      axios.get('https://api.pinterest.com/v5/pins', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get('https://api.pinterest.com/v5/user_account', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);
    res.json({
      user: userRes.data,
      items: pinsRes.data.items
    });
  } catch (err) {
    console.error('Pinterest API error:', err.response?.data || err);
    res.status(500).send('Error fetching pins & user info');
  }
});

// === Helper: fetch remote image into Buffer ===
async function fetchImageBuffer(url) {
  const resp = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(resp.data, 'binary');
}

// === Shared Artwork Processing Function ===
async function processArtwork({ buffer, mimetype, userId, title, genres }) {
  // 1) Vision API annotation
    logRequest({message: `sending off to vision api with title: ${title} and genres: ${genres.toString()}`});

  const [result] = await visionClient.annotateImage({
    image: { content: buffer.toString('base64') },
    features: [
      { type: 'LABEL_DETECTION' },
      { type: 'FACE_DETECTION' },
      { type: 'OBJECT_LOCALIZATION' },
      { type: 'IMAGE_PROPERTIES' },
      { type: 'SAFE_SEARCH_DETECTION' },
      { type: 'LANDMARK_DETECTION' },
      { type: 'TEXT_DETECTION' },
      { type: 'LOGO_DETECTION' },
      { type: 'WEB_DETECTION' }
    ]
  });

  // 2) Build analysis object
  // All below is feeding the vision api information to gemini
  const analysis = {
    genres,
    labels: result.labelAnnotations?.map(l => ({
      description: l.description,
      score: l.score
    })) || [],
    faces: result.faceAnnotations?.map(face => ({
      joyLikelihood: face.joyLikelihood,
      sorrowLikelihood: face.sorrowLikelihood,
      angerLikelihood: face.angerLikelihood,
      surpriseLikelihood: face.surpriseLikelihood,
      bounds: face.boundingPoly.vertices?.map(v => ({ x: v.x, y: v.y })) || []
    })) || [],
    objects: result.localizedObjectAnnotations?.map(o => ({
      name: o.name,
      score: o.score
    })) || [],
    colors: result.imagePropertiesAnnotation?.dominantColors.colors.map(c => ({
      red: c.color.red || 0,
      green: c.color.green || 0,
      blue: c.color.blue || 0
    })) || [],
    safeSearch: result.safeSearchAnnotation || {},
    landmarks: result.landmarkAnnotations?.map(l => ({ name: l.description })) || [],
    texts: result.textAnnotations?.map(t => ({ content: t.description })) || [],
    logos: result.logoAnnotations?.map(l => ({ name: l.description })) || [],
    web: {
      entities: result.webDetection?.webEntities?.map(e => ({ description: e.description })) || []
    }
  };

  // Helper to describe colors
  function describeColor(color) {
    const { red, green, blue } = color;
    const hue = Math.atan2(
      Math.sqrt(3) * (green - blue),
      2 * red - green - blue
    );
    const hueAngle = Math.abs(hue * 180 / Math.PI);
    if (hueAngle >= 330 || hueAngle < 30) return 'vibrant red';
    if (hueAngle >= 30 && hueAngle < 90) return 'sunny yellow';
    if (hueAngle >= 90 && hueAngle < 150) return 'lush green';
    if (hueAngle >= 150 && hueAngle < 210) return 'deep cyan';
    if (hueAngle >= 210 && hueAngle < 270) return 'royal blue';
    if (hueAngle >= 270 && hueAngle < 330) return 'majestic purple';
    return 'neutral tone';
  }

  // Prepare dynamic prompt pieces
  const colorDescriptions = analysis.colors.length > 0
    ? analysis.colors.map(c => describeColor(c)).join(', ')
    : 'vibrant red, deep blue, forest green';

  const objectNames = analysis.objects.length > 0
    ? analysis.objects.map(o => o.name).join(', ')
    : 'mysterious object, shadowy figure, ancient artifact';

  const webEntities = analysis.web.entities.length > 0
    ? analysis.web.entities.slice(0, 3).map(e => e.description).join(', ')
    : 'hidden secret, unexpected discovery, ancient myth';

  const landmarkNames = analysis.landmarks.length > 0
    ? analysis.landmarks.map(l => l.name).join(', ')
    : 'towering mountain, hidden valley, ancient temple';

  const colorTransition = analysis.colors.length > 0
    ? analysis.colors.map(c => describeColor(c)).join(' to ')
    : 'vibrant red to deep blue to forest green';

  const emotionalTones = analysis.faces.length > 0
    ? analysis.faces.map(f =>
        `${f.joyLikelihood} joy/${f.sorrowLikelihood} sorrow`
      ).join('; ')
    : 'POSSIBLE joy/POSSIBLE sorrow';

  const genreDescription = genres.length > 0
    ? genres.map(g => {
        const name = g.id.charAt(0).toUpperCase() +
                     g.id.slice(1).replace(/-/g, ' ');
        return g.style
          ? `${name} (${g.style.replace(/-/g, ' ')})`
          : name;
      }).join(', ')
    : 'general fiction';

  // 3) Ask Gemini to generate the story JSON
  // We went with trying to force a 5 act structure to have a mostly-consistent 5 images
  const structuredPrompt = `Generate a creative ${genreDescription} story based on an image analysis.
Return ONLY a valid JSON object with the following structure and NO additional text:

{
  "introduction": "Write a setting and character introduction paragraph using ${colorDescriptions} colors. At most 5 sentences.",
  "rising_action": "Write a conflict development paragraph with ${objectNames}. At most 5 sentences.",
  "twist": "Write an unexpected revelation paragraph involving ${webEntities}. At most 5 sentences.",
  "climax": "Write a peak conflict paragraph using ${landmarkNames}. At most 5 sentences.",
  "resolution": "Write a conclusion paragraph reflecting ${colorTransition} color transition. At most 5 sentences."
}

Use dramatic language and incorporate these emotional tones: ${emotionalTones}`;

  let analysisStory = {};

  // Utility to pause
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Image generation helpers
  async function generateStoryImage(promptText, section) {
    logRequest({message: "generating image with prompt: ", promptText});
    const imageModel = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseModalities: ['Text', 'Image'] }
    });
    const resp = await imageModel.generateContent(promptText);
    const parts = resp.response.candidates[0].content.parts;
    if (!parts) return null;
    for (const p of parts) {
      if (p.inlineData) return p.inlineData.data;
    }
    return null;
  }

  // Gemini is not guaranteed to give you an image so just in case it doesn't 
  // we have a function to try really hard to get it to give us an image
  async function generateStoryImageWithRetry(sectionText, section, maxAttempts = 3) {
    logRequest({message: "generating (retry) image with prompt: ", sectionText});
    const variations = [
      `Generate a vivid illustration for: ${sectionText}. 2560×1440.`,
      `Create an image showing: ${sectionText}. 2560×1440.`,
      `Visualize this scene: ${sectionText}. 2560×1440.`,
      `Draw an illustration: ${sectionText}. 2560×1440.`
    ];
    let img = null, attempts = 0;
    while (!img && attempts < maxAttempts) {
      img = await generateStoryImage(variations[attempts % variations.length], section);
      if (!img) {
        attempts++;
        await delay(1500);
      }
    }
    return img;
  }

  // A way to try and get a better image by first having the AI
  // create a description of it's story, then telling it to generate
  // an image from that
  async function generateImageTwoStep(sectionText, section) {
    logRequest({message: "generating image (two step) with prompt: ", sectionText});
    const descModel = genAI.getGenerativeModel({ model: modelName });
    const descResp = await descModel.generateContent(
      `Describe this scene in 3-4 sentences: ${sectionText}`
    );
    const imagePrompt = `Generate a 2560×1440 image based on: ${descResp.response.text()}`;
    await delay(1000);
    return generateStoryImage(imagePrompt, section);
  }

  // Attempt to generate story JSON
  try {
    logRequest({message: "attemping to generate story json with prompt: ", structuredPrompt});
    const model = genAI.getGenerativeModel({ model: modelName });
    const geminiResp = await model.generateContent(structuredPrompt);
    const text = geminiResp.response.text();
    // Matches text inside of curly braces {like this text} to extract the story information 
    const match = text.match(/\{[\s\S]*\}/);
    analysisStory = match ? JSON.parse(match[0]) : {};
  } catch (e) {
    logRequest({error: e.message});
    console.error('Story generation error:', e);
    // Backup text to display that hopefully doesn't have to show up
    analysisStory = {
      introduction: `A world awash in ${colorDescriptions} came to life.`,
      rising_action: `Conflict emerged when ${objectNames} appeared.`,
      twist: `Everything changed upon discovering ${webEntities}.`,
      climax: `The peak conflict reached at ${landmarkNames}.`,
      resolution: `In the end, colors shifted from ${colorTransition}, bringing calm.`
    };
  }

  analysis.story = analysisStory;

  // 4) Generate images for each section
  const sections = ['introduction', 'rising_action', 'twist', 'climax', 'resolution'];
  const generatedImages = {};

  // Generate 1 image per section
  for (const section of sections) {
    const secText = analysisStory[section];
    if (!secText) {
      generatedImages[section] = null;
      continue;
    }
    await delay(1000);
    if (section === 'resolution') {
      generatedImages[section] =
        await generateImageTwoStep(secText, section)
        || await generateStoryImageWithRetry(secText, section, 4);
    } else {
      generatedImages[section] =
        await generateStoryImageWithRetry(secText, section, 3);
    }
  }

  // 5) Upload each generated image to Firebase Storage & collect URLs
  const storyImageRefs = {};
  const artworkId = db.collection('artworks').doc().id;
  const artworkRef = db.collection('artworks').doc(artworkId);

  // Save each image individually 
  for (const section of sections) {
    const data = generatedImages[section];
    if (!data) continue;

    // Convert base64 to Buffer if necessary
    const imageBuffer = Buffer.isBuffer(data)
      ? data
      : Buffer.from(data, 'base64');

    const filename = `story-images/${artworkId}_${section}.png`;
    const file = bucket.file(filename);

    await file.save(imageBuffer, {
      contentType: 'image/png',
      metadata: { contentType: 'image/png' }
    });
    await file.makePublic();

    storyImageRefs[section] = file.publicUrl();
  }

  // 6) Upload the **original** image to Storage & get its URL
  const ext = mimetype.split('/')[1];       // e.g. "jpeg" or "png"
  const originalPath = `artworks/${artworkId}_original.${ext}`;
  const originalFile = bucket.file(originalPath);
  await originalFile.save(buffer, {
    contentType: mimetype,
    metadata: { contentType: mimetype }
  });
  await originalFile.makePublic();
  const originalUrl = originalFile.publicUrl();

  // 7) Save artwork document to Firestore (only URLs, no raw binary)
  logRequest({message: "saving to firestore", title});
  await artworkRef.set({
    userId,
    title,
    genres,
    analysis,
    storyImageRefs,
    originalImageUrl: originalUrl,
    shared: false,
    createdAt: FieldValue.serverTimestamp()
  }, { merge: true });

  // 8) Return the payload
  return {
    id: artworkId,
    analysis: { ...analysis, story: analysisStory },
    imageUrls: {
      original: originalUrl,
      ...storyImageRefs
    }
  };
}

// === API: Import from Pinterest URL ===
app.post('/api/artworks/import', async (req, res) => {
  try {
    const { userId, title, imageUrl, genres } = req.body;
    if (!userId || !imageUrl) {
      return res.status(400).json({ error: 'Missing userId or imageUrl' });
    }
    const buffer = await fetchImageBuffer(imageUrl);
    const mimetype = 'image/jpeg';
    const result = await processArtwork({ buffer, mimetype, userId, title, genres });
    res.status(201).json(result);
  } catch (err) {
    console.error('Import-pin error:', err);
    res.status(500).json({ error: 'Import failed', details: err.message });
  }
});

// === Multer for direct uploads ===
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    file.mimetype.startsWith('image/')
      ? cb(null, true)
      : cb(new Error('Only images are allowed'));
  }
});

// === POST /api/artworks (file upload) ===
app.post('/api/artworks', upload.single('image'), async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const mimetype = req.file.mimetype;
    const { userId, title } = req.body;
    const genres = req.body.genres ? JSON.parse(req.body.genres) : [];
    const result = await processArtwork({ buffer, mimetype, userId, title, genres });
    res.status(201).json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed', details: error.message });
  }
});

// === GET /api/artworks/history ===
// Returns user's history of artworks
app.get('/api/artworks/history', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // No real security done to check that requested user's artworks is logged in
    const snapshot = await db.collection('artworks')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    if (snapshot.empty) {
      return res.json([]);
    }

    const formatted = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      formatted.push({
        _id: doc.id,
        title: data.title,
        genres: data.genres,
        createdAt: data.createdAt?.toDate() || new Date(),
        imageUrl: data.originalImageUrl
      });
    }

    res.json(formatted);
  } catch (error) {
    console.error('Artwork history error:', error);
    res.status(500).json({ error: 'Failed to fetch artwork history', details: error.message });
  }
});

// === GET /api/artworks/:id ===
// For viewing a single artwork
app.get('/api/artworks/:id', async (req, res) => {
  try {
    const artworkId = req.params.id;
    const userId = req.query.userId;

    const doc = await db.collection('artworks').doc(artworkId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    const artwork = doc.data();
    // Extremely simple and not secure check
    if (artwork.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const imageUrls = {
      original: artwork.originalImageUrl,
      ...artwork.storyImageRefs
    };

    res.json({ analysis: artwork.analysis, storyImages: imageUrls });
  } catch (error) {
    console.error('Artwork details error:', error);
    res.status(500).json({ error: 'Failed to fetch artwork details', details: error.message });
  }
});




// === DELETE /api/artworks/:id ===
app.delete('/api/artworks/:id', async (req, res) => {
  try {
    const artworkId = req.params.id;
    const userId = req.query.userId;

    if (!artworkId || !userId) {
      return res.status(400).json({ error: 'Missing artworkId or userId' });
    }

    const docRef = db.collection('artworks').doc(artworkId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    const artwork = doc.data();
    if (artwork.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Step 1: Delete Firebase Storage picture
    const filesToDelete = [];

    // Delete the original picture
    if (artwork.originalImageUrl) {
      const originalPath = extractStoragePathFromUrl(artwork.originalImageUrl);
      if (originalPath) filesToDelete.push(originalPath);
    }

    // Delete some images from each story
    if (artwork.storyImageRefs) {
      Object.values(artwork.storyImageRefs).forEach(url => {
        const path = extractStoragePathFromUrl(url);
        if (path) filesToDelete.push(path);
      });
    }

    // Delete Firebase Storage doc
    for (const filePath of filesToDelete) {
      const file = bucket.file(filePath);
      await file.delete().catch(err => {
        console.error(`Failed to delete storage file ${filePath}:`, err.message);
      });
    }


    await docRef.delete();

    res.status(200).json({ message: 'Artwork and associated files deleted successfully' });

  } catch (error) {
    console.error('Delete artwork error:', error);
    res.status(500).json({ error: 'Failed to delete artwork', details: error.message });
  }
});

// === Helper function: get the Storage URL
function extractStoragePathFromUrl(publicUrl) {
  try {
    const storageDomain = `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/`;
    if (publicUrl.startsWith(storageDomain)) {
      const encodedPath = publicUrl.replace(storageDomain, '');
      const decodedPath = decodeURIComponent(encodedPath);
      return decodedPath;
    }
    return null;
  } catch {
    return null;
  }
}








// === Start Server ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
