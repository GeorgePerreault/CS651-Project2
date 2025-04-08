const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();
const app = express();
const visionClient = new ImageAnnotatorClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const modelName = "gemini-2.0-flash-exp-image-generation";

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define Artwork schema
const artworkSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  image: {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true }
  },
  genres: [{
    id: String,
    style: String
  }],
  analysis: mongoose.Schema.Types.Mixed,
  storyImages: {
    introduction: String,
    rising_action: String,
    twist: String,
    climax: String,
    resolution: String
  },
  shared: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Artwork = mongoose.model('Artwork', artworkSchema);

// Configure Multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    file.mimetype.startsWith('image/')
      ? cb(null, true)
      : cb(new Error('Only images are allowed'));
  }
});

// Utility functions
function describeColor(color) {
  const { red, green, blue } = color;
  const hue = Math.atan2(Math.sqrt(3) * (green - blue), 2 * red - green - blue);
  const hueAngle = Math.abs(hue * 180 / Math.PI);
  
  if (hueAngle >= 330 || hueAngle < 30) return 'vibrant red';
  if (hueAngle >= 30 && hueAngle < 90) return 'sunny yellow';
  if (hueAngle >= 90 && hueAngle < 150) return 'lush green';
  if (hueAngle >= 150 && hueAngle < 210) return 'deep cyan';
  if (hueAngle >= 210 && hueAngle < 270) return 'royal blue';
  if (hueAngle >= 270 && hueAngle < 330) return 'majestic purple';
  return 'neutral tone';
}

function isValidBase64(str) {
  if (!str) return false;
  try {
    return Buffer.from(str, 'base64').toString('base64') === str;
  } catch (e) {
    return false;
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateStoryImage(promptText, section) {
  console.log(`generateStoryImage for ${section} - Prompt: ${promptText}`);
  try {
    const imageModel = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseModalities: ['Text', 'Image'],
      },
    });
    const response = await imageModel.generateContent(promptText);
    console.log(`generateStoryImage for ${section} - Response status:`, 
      response.response.promptFeedback ? JSON.stringify(response.response.promptFeedback) : "No prompt feedback");
    
    const parts = response.response.candidates[0].content.parts;
    if (!parts || parts.length === 0) {
      console.log(`generateStoryImage for ${section} - No parts in response`);
      return null;
    }
    for (const part of parts) {
      if (part.inlineData) {
        console.log(`generateStoryImage for ${section} - Image Data Found`);
        return part.inlineData.data;
      }
    }
    console.log(`generateStoryImage for ${section} - No Image Data Found in parts:`, 
      parts.map(p => Object.keys(p)));
    return null;
  } catch (error) {
    console.error(`generateStoryImage for ${section} - Error:`, error.message);
    console.error(`generateStoryImage for ${section} - Stack:`, error.stack);
    return null;
  }
}

async function generateStoryImageWithRetry(sectionText, section, maxAttempts = 3) {
  let attempts = 0;
  let generatedImage = null;
  const promptVariations = [
    `Generate a vivid illustration for this story section: ${sectionText}. Use 2560×1440 aspect ratio. Important: Please create and return an image.`,
    `Create an image showing: ${sectionText} in 2560×1440 dimensions. I need this returned as an image, not text.`,
    `Visualize this scene as an image: ${sectionText}. The output should be a 2560px wide by 1440px tall image.`,
    `Draw an illustration for this story: ${sectionText}. Please return an image with 2560×1440 resolution.`
  ];
  while (!generatedImage && attempts < maxAttempts) {
    const promptText = promptVariations[attempts % promptVariations.length];
    console.log(`Attempt ${attempts + 1} for ${section} image generation`);
    generatedImage = await generateStoryImage(promptText, section);
    if (!generatedImage) {
      console.log(`No image generated for ${section} on attempt ${attempts + 1}, retrying...`);
      await delay(1500);
      attempts++;
    }
  }
  return generatedImage;
}

async function generateImageTwoStep(sectionText, section) {
  try {
    console.log(`Generating description for ${section} image`);
    const descriptionModel = genAI.getGenerativeModel({ model: modelName });
    const descriptionPrompt = `Create a detailed visual description for this scene in 3-4 sentences: ${sectionText}`;
    const descriptionResponse = await descriptionModel.generateContent(descriptionPrompt);
    const imageDescription = descriptionResponse.response.text();
    console.log(`Description generated for ${section}:`, imageDescription);
    await delay(1000);
    console.log(`Using description to generate ${section} image`);
    const imagePrompt = `Generate an image based on this description: ${imageDescription}. Create a 2560×1440 aspect ratio image. Important: Return only the image.`;
    return await generateStoryImage(imagePrompt, section);
  } catch (error) {
    console.error(`Error in two-step image generation for ${section}:`, error);
    return null;
  }
}

// POST /api/artworks - Upload artwork and run analysis
app.post('/api/artworks', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    const genres = req.body.genres ? JSON.parse(req.body.genres) : [];
    const [result] = await visionClient.annotateImage({
      image: { content: req.file.buffer.toString('base64') },
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
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
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
      landmarks: result.landmarkAnnotations?.map(l => ({
        name: l.description
      })) || [],
      texts: result.textAnnotations?.map(t => ({
        content: t.description
      })) || [],
      logos: result.logoAnnotations?.map(l => ({
        name: l.description
      })) || [],
      web: {
        entities: result.webDetection?.webEntities?.map(e => ({
          description: e.description
        })) || []
      }
    };

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
      ? analysis.faces.map(f => `${f.joyLikelihood} joy/${f.sorrowLikelihood} sorrow`).join('; ')
      : 'POSSIBLE joy/POSSIBLE sorrow';
    const genreDescription = genres.length > 0 
      ? genres.map(g => {
          const genreName = g.id.charAt(0).toUpperCase() + g.id.slice(1).replace(/-/g, ' ');
          return g.style 
            ? `${genreName} (${g.style.replace(/-/g, ' ')})`
            : genreName;
        }).join(', ')
      : 'general fiction';

    const structuredPrompt = `Generate a creative ${genreDescription} story based on an image analysis. 
Return ONLY a valid JSON object with the following structure and NO additional text, commentary, or markdown formatting:

{
  "introduction": "Write a setting and character introduction paragraph using ${colorDescriptions} colors. Make the introduction paragraph at most 5 sentences.",
  "rising_action": "Write a conflict development paragraph with ${objectNames}. Make the rising action paragraph at most 5 sentences.",
  "twist": "Write an unexpected revelation paragraph involving ${webEntities}. Make the twist paragraph at most 5 sentences.",
  "climax": "Write a peak conflict paragraph using ${landmarkNames}. Make the climax paragraph at most 5 sentences.",
  "resolution": "Write a conclusion paragraph reflecting ${colorTransition} color transition. Make the resolution paragraph at most 5 sentences."
}

Use dramatic language and incorporate these emotional tones: ${emotionalTones}

IMPORTANT: Return ONLY a pure JSON object that can be parsed with JSON.parse() - no extra text, no explanations, just the JSON.`;

    let analysisStory = {};
    try {
      console.log("Sending prompt to Gemini:", structuredPrompt);
      const model = genAI.getGenerativeModel({ model: modelName });
      const geminiResponse = await model.generateContent(structuredPrompt);
      const responseText = geminiResponse.response.text();
      console.log("Raw Gemini response:", responseText);
      let jsonMatch = responseText.match(/\{[\s\S]*\}/);
      let jsonString = jsonMatch ? jsonMatch[0] : null;
      try {
        if (jsonString) {
          analysisStory = JSON.parse(jsonString);
          console.log("Successfully parsed JSON directly");
        } else {
          const fixedText = responseText
            .replace(/(\w+):/g, '"$1":')
            .replace(/:\s*"([^"]*)"([,}])/g, ':"$1"$2')
            .match(/\{[\s\S]*\}/);
          if (fixedText) {
            analysisStory = JSON.parse(fixedText[0]);
            console.log("Successfully parsed JSON after fixing format");
          } else {
            throw new Error("Could not extract valid JSON");
          }
        }
      } catch (parseError) {
        console.error('Error parsing story JSON:', parseError);
        console.error('Problematic responseText:', responseText);
        const extractSection = (section, fallback) => {
          const regex = new RegExp(`["']${section}["']\\s*:\\s*["']([^"']+)["']`, 'i');
          const match = responseText.match(regex);
          if (match && match[1]) {
            return match[1].replace(/\\"/g, '"').replace(/\\n/g, ' ');
          }
          const altRegex = new RegExp(`${section}\\s*:\\s*["']([^"']+)["']`, 'i');
          const altMatch = responseText.match(altRegex);
          if (altMatch && altMatch[1]) {
            return altMatch[1].replace(/\\"/g, '"').replace(/\\n/g, ' ');
          }
          return fallback || `Could not generate ${section}`;
        };
        const sections = ['introduction', 'rising_action', 'twist', 'climax', 'resolution'];
        const contentMap = {};
        let contentSoFar = responseText;
        for (let i = 0; i < sections.length; i++) {
          const currentSection = sections[i];
          const nextSection = sections[i + 1];
          if (nextSection) {
            const sectionStart = contentSoFar.indexOf(currentSection);
            const nextSectionStart = contentSoFar.indexOf(nextSection);
            if (sectionStart !== -1 && nextSectionStart !== -1 && nextSectionStart > sectionStart) {
              let content = contentSoFar.substring(sectionStart + currentSection.length, nextSectionStart);
              content = content.replace(/^[:"'\s]+|[,"'\s]+$/g, '');
              contentMap[currentSection] = content || `Could not generate ${currentSection}`;
            } else {
              contentMap[currentSection] = extractSection(currentSection);
            }
          } else {
            contentMap[currentSection] = extractSection(currentSection);
          }
        }
        if (Object.keys(contentMap).length) {
          analysisStory = {
            introduction: contentMap.introduction || extractSection("introduction"),
            rising_action: contentMap.rising_action || extractSection("rising_action"),
            twist: contentMap.twist || extractSection("twist"),
            climax: contentMap.climax || extractSection("climax"),
            resolution: contentMap.resolution || extractSection("resolution")
          };
          console.log("Extracted story sections from text");
        } else {
          analysisStory = {
            introduction: `A world awash in ${colorDescriptions} came to life as the morning sun rose.`,
            rising_action: `Conflict emerged when ${objectNames} appeared on the horizon.`,
            twist: `Everything changed when they discovered ${webEntities}.`,
            climax: `The confrontation reached its peak at ${landmarkNames}.`,
            resolution: `As the dust settled, the colors shifted from ${colorTransition}, bringing peace.`
          };
          console.log("Used fallback story sections");
        }
      }
    } catch (geminiError) {
      console.error("Error generating content:", geminiError);
      analysisStory = {
        introduction: `A world awash in ${colorDescriptions} came to life as the morning sun rose.`,
        rising_action: `Conflict emerged when ${objectNames} appeared on the horizon.`,
        twist: `Everything changed when they discovered ${webEntities}.`,
        climax: `The confrontation reached its peak at ${landmarkNames}.`,
        resolution: `As the dust settled, the colors shifted from ${colorTransition}, bringing peace.`
      };
    }
    analysis.story = analysisStory;

    const newArtwork = new Artwork({
      userId,
      title: req.body.title,
      image: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      },
      genres,
      analysis
    });
    
    const storySections = ['introduction', 'rising_action', 'twist', 'climax', 'resolution'];
    const generatedImages = {};
    for (const section of storySections) {
      if (analysis.story[section]) {
        try {
          console.log(`Beginning image generation process for section: ${section}`);
          await delay(1000);
          if (section === 'resolution') {
            console.log("Using two-step approach for resolution section");
            generatedImages[section] = await generateImageTwoStep(analysis.story[section], section);
            if (!generatedImages[section]) {
              console.log("Two-step approach failed for resolution, trying retry approach");
              generatedImages[section] = await generateStoryImageWithRetry(analysis.story[section], section, 4);
            }
          } else {
            generatedImages[section] = await generateStoryImageWithRetry(analysis.story[section], section, 3);
          }
          if (generatedImages[section]) {
            console.log(`Image generated for ${section}: ${isValidBase64(generatedImages[section]) ? 'Valid' : 'Invalid'} base64`);
          } else {
            console.log(`Failed to generate image for ${section} after all attempts`);
          }
        } catch (imageGenError) {
          console.error(`Error generating image for ${section}:`, imageGenError);
          generatedImages[section] = null;
        }
      } else {
        console.log(`No story for section: ${section}`);
        generatedImages[section] = null;
      }
    }
    if (!generatedImages['resolution'] && analysis.story['resolution']) {
      try {
        console.log("Final attempt for resolution image with explicit image request");
        const forcedPrompt = `I need an image for this story ending. Please create a 2560×1440 image that shows: ${analysis.story['resolution']}. THIS MUST BE RETURNED AS AN IMAGE, NOT TEXT.`;
        await delay(2000);
        generatedImages['resolution'] = await generateStoryImage(forcedPrompt, 'resolution');
      } catch (finalError) {
        console.error("Final resolution image attempt failed:", finalError);
      }
    }
    
    newArtwork.storyImages = generatedImages;
    await newArtwork.save();
    
    const responseData = {
      analysis: {
        ...analysis,
        story: {
          ...analysis.story,
          images: generatedImages
        }
      },
      imageUrls: Object.fromEntries(
        Object.entries(generatedImages).map(([key, val]) =>
          [key, val ? `data:image/png;base64,${val}` : null]
        )
      )
    };
    
    res.status(201).json(responseData);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      details: error.message
    });
  }
});

// GET /api/artworks/history - Return artwork history with imageUrl
app.get('/api/artworks/history', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const artworkHistory = await Artwork.find({ userId })
      .sort({ createdAt: -1 })
      .select('title genres createdAt image');
    const artworkHistoryWithImages = artworkHistory.map(artwork => ({
      _id: artwork._id,
      title: artwork.title,
      genres: artwork.genres,
      createdAt: artwork.createdAt,
      imageUrl: artwork.image && artwork.image.data 
        ? `data:${artwork.image.contentType};base64,${artwork.image.data.toString('base64')}`
        : null
    }));
    res.status(200).json(artworkHistoryWithImages);
  } catch (error) {
    console.error('Artwork history error:', error);
    res.status(500).json({
      error: 'Failed to fetch artwork history',
      details: error.message
    });
  }
});

// GET /api/artworks/:id - Return full artwork details
app.get('/api/artworks/:id', async (req, res) => {
  try {
    const artworkId = req.params.id;
    const userId = req.query.userId;
    const artwork = await Artwork.findOne({ _id: artworkId, userId });
    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }
    res.status(200).json({
      analysis: artwork.analysis,
      storyImages: Object.fromEntries(
        Object.entries(artwork.storyImages).map(([key, val]) =>
          [key, val ? `data:image/png;base64,${val}` : null]
        )
      )
    });
  } catch (error) {
    console.error('Artwork details error:', error);
    res.status(500).json({
      error: 'Failed to fetch artwork details',
      details: error.message
    });
  }
});




const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
