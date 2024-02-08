const express = require('express');
const RobloxAssetFetcher = require('./modules/moderation/image');
const app = express();
const port = process.env.PORT;

const fetcher = new RobloxAssetFetcher();

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

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
