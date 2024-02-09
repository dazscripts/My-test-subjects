const express = require('express');

const modpath = './modules/moderation/'
const RobloxAssetFetcher = require(modpath+'filemanager.js');
const OpenAIImageModerator = require(modpath+'responses.js');

var app = express();
const port = process.env.PORT;

const fetcher = new RobloxAssetFetcher();
const apiKey = process.env.OPENAI_API_KEY;
const openAIModerator = new OpenAIImageModerator(apiKey);

app.use('/assets', express.static('assets'));


app.get('/v1/filter/s/:assetId', async (req, res) => {
  const { assetId } = req.params;
  try {
    assetId = fetcher.fetchRbxDecal(assetId)
    const buffer = await fetcher.fetchImageBuffer(assetId);
    await fetcher.storeImage(assetId, buffer);
    res.json({ success: true, message: `Image ${assetId} saved successfully.` });
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.get('/v1/filter/v/:assetId', (req, res) => {
  const { assetId } = req.params;
  const imagePath = fetcher.getStoredImagePath(assetId);
  if (imagePath) {
    res.sendFile(imagePath);
  } else {
    res.status(404).send('Image not found.');
  }
});

app.get('/v1/filter/i/:assetId', async (req, res) => {
  const { assetId } = req.params;
  const imagePath = fetcher.getStoredImagePath(assetId);
  if (!imagePath) {
    return res.status(404).send('Image not found.');
  }
  const imageUrl = `https://kuiba.onrender.com/v1/filter/v/${assetId}`; 
  try {
    const analysisResult = await openAIModerator.analyzeImage(imageUrl);
    res.json({ success: true, analysis: analysisResult });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/v1/filter/t/:input', async (req, res) => {
  const { input } = req.params;
  
  try {
    const analysisResult = await openAIModerator.filterstring(input);
    res.json({ success: true, analysis: analysisResult });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
