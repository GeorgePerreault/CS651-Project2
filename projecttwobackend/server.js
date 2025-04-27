
// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const session = require('express-session');
const axios = require('axios');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Logging } = require("@google-cloud/logging")

//Imports for logging/analytics
//All the Google Analytics stuff will not work until we deploy the site
//Uncomment all the Analytics stuff once we got the site deployed!
// const axios = require("axios");
// function trackEvent(eventName) {
//   axios.post("https://www.google-analytics.com/mp/collect", {
//     client_id: "your-client-id",
//     events: [{ name: eventName }],
//   });
// }

const logging = new Logging();
const log = logging.log("gemini-api-requests");
async function logRequest(dataToLog) {
    const metadata = { resource: { type: "global" } };
    const entry = log.entry(metadata, dataToLog);
    await log.write(entry);
}

const app = express();
const visionClient = new ImageAnnotatorClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const modelName = "gemini-2.0-flash-exp-image-generation";

// === Middleware ===
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['POST', 'GET'],
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

// === MongoDB Connection ===
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// === Artwork Schema & Model (shared) ===
const artworkSchema = new mongoose.Schema({
  userId:     { type: String, required: true },
  title:      { type: String, required: true },
  image:      {
    data: Buffer,
    contentType: String
  },
  genres:     [{ id: String, style: String }],
  analysis:   mongoose.Schema.Types.Mixed,
  storyImages: mongoose.Schema.Types.Mixed,
  shared:     { type: Boolean, default: false },
  createdAt:  { type: Date, default: Date.now }
});
const Artwork = mongoose.model('Artwork', artworkSchema);

// === Pinterest OAuth + Basic API ===
const { PINTEREST_APP_ID, PINTEREST_APP_SECRET, REDIRECT_URI } = process.env;

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
          'Authorization': 'Basic ' +
            Buffer.from(`${PINTEREST_APP_ID}:${PINTEREST_APP_SECRET}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    req.session.accessToken = tokenRes.data.access_token;
    res.redirect('http://localhost:5173/pins');
  } catch (err) {
    console.error('Token exchange error:', err.response?.data || err);
    res.status(500).send('Failed to get access token');
  }
});

app.get('/api/pins', async (req, res) => {
  const token = req.session.accessToken;
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
  const structuredPrompt =
`Generate a creative ${genreDescription} story based on an image analysis.
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

  // Generate images functions
  async function generateStoryImage(promptText, section) {
    const imageModel = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseModalities: ['Text','Image'] }
    });
    const resp = await imageModel.generateContent(promptText);
    const parts = resp.response.candidates[0].content.parts;
    if (!parts) return null;
    for (const p of parts) {
      if (p.inlineData) return p.inlineData.data;
    }
    return null;
  }

  async function generateStoryImageWithRetry(sectionText, section, maxAttempts=3) {
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

  async function generateImageTwoStep(sectionText, section) {
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
    const model = genAI.getGenerativeModel({ model: modelName });
    const geminiResp = await model.generateContent(structuredPrompt);
    const text = geminiResp.response.text();
    const match = text.match(/\{[\s\S]*\}/);
    analysisStory = match ? JSON.parse(match[0]) : {};
  } catch (e) {
    console.error("Story generation error:", e);
    // fallback
    analysisStory = {
      introduction: `A world awash in ${colorDescriptions} came to life.`,
      rising_action: `Conflict emerged when ${objectNames} appeared.`,
      twist: `Everything changed upon discovering ${webEntities}.`,
      climax: `The peak conflict reached at ${landmarkNames}.`,
      resolution: `In the end, colors shifted from ${colorTransition}, bringing calm.`
    };
  }
  analysis.story = analysisStory;

  // 5) Create & save images for each section
  const sections = ['introduction','rising_action','twist','climax','resolution'];
  const generatedImages = {};

  for (const section of sections) {
    const secText = analysisStory[section];
    if (!secText) {
      generatedImages[section] = null;
      continue;
    }
    await delay(1000);
    if (section === 'resolution') {
      generatedImages[section] = await generateImageTwoStep(secText, section)
        || await generateStoryImageWithRetry(secText, section, 4);
    } else {
      generatedImages[section] = await generateStoryImageWithRetry(secText, section, 3);
    }
  }

  // Final fallback for resolution if needed
  if (!generatedImages.resolution && analysisStory.resolution) {
    await delay(2000);
    generatedImages.resolution = await generateStoryImage(
      `I need an image for the ending: ${analysisStory.resolution}. Return only image.`,
      'resolution'
    );
  }

  // 6) Save artwork document
  const newArtwork = new Artwork({
    userId,
    title,
    image: { data: buffer, contentType: mimetype },
    genres,
    analysis,
    storyImages: generatedImages
  });
  await newArtwork.save();

  // 7) Build response payload
  const imageUrls = {};
  sections.forEach(sec => {
    const data = generatedImages[sec];
    imageUrls[sec] = data ? `data:image/png;base64,${data}` : null;
  });

  return {
    analysis: { ...analysis, story: analysisStory },
    imageUrls
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
    console.error("Import-pin error:", err);
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
    const buffer   = req.file.buffer;
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
app.get('/api/artworks/history', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const history = await Artwork.find({ userId })
      .sort({ createdAt: -1 })
      .select('title genres createdAt image');
    const formatted = history.map(a => ({
      _id:       a._id,
      title:     a.title,
      genres:    a.genres,
      createdAt: a.createdAt,
      imageUrl:  a.image?.data
        ? `data:${a.image.contentType};base64,${a.image.data.toString('base64')}`
        : null
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Artwork history error:', error);
    res.status(500).json({ error: 'Failed to fetch artwork history', details: error.message });
  }
});

// === GET /api/artworks/:id ===
app.get('/api/artworks/:id', async (req, res) => {
  try {
    const artworkId = req.params.id;
    const userId = req.query.userId;
    const artwork = await Artwork.findOne({ _id: artworkId, userId });
    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }
    const imageUrls = {};
    Object.entries(artwork.storyImages || {}).forEach(([sec, data]) => {
      imageUrls[sec] = data
        ? `data:image/png;base64,${data.toString('base64')}`
        : null;
    });
    res.json({ analysis: artwork.analysis, storyImages: imageUrls });
  } catch (error) {
    console.error('Artwork details error:', error);
    res.status(500).json({ error: 'Failed to fetch artwork details', details: error.message });
  }
});

// === Start Server ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));