const express = require('express');
const RobloxAssetFetcher = require('./modules/moderation/image.js');
const OpenAIImageModerator = require('./modules/moderation/interact.js');

const app = express();
const port = process.env.PORT;

const fetcher = new RobloxAssetFetcher();
const apiKey = 'process.env.aikey'; // Ensure you use your actual API key
const openAIModerator = new OpenAIImageModerator(apiKey);

app.use('/assets', express.static('assets'));

// Endpoint to fetch and store an image from Roblox
app.get('/saveImage/:assetId', async (req, res) => {
  const { assetId } = req.params;
  try {
    const buffer = await fetcher.fetchImageBuffer(assetId);
    await fetcher.storeImage(assetId, buffer);
    res.json({ success: true, message: `Image ${assetId} saved successfully.` });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Endpoint to view a saved image
app.get('/viewImage/:assetId', (req, res) => {
  const { assetId } = req.params;
  const imagePath = fetcher.getStoredImagePath(assetId);
  if (imagePath) {
    res.sendFile(imagePath);
  } else {
    res.status(404).send('Image not found.');
  }
});

app.get('/analyzeImage/:assetId', async (req, res) => {
  const { assetId } = req.params;
  const imagePath = fetcher.getStoredImagePath(assetId);
  if (!imagePath) {
    return res.status(404).send('Image not found.');
  }
  const imageUrl = `Your_Express_Server_URL/assets/${assetId}.png`; // Adjust with your actual server URL
  try {
    const analysisResult = await openAIModerator.analyzeImage(imageUrl);
    res.json({ success: true, analysis: analysisResult });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
