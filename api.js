const express = require('express');
const RobloxAssetFetcher = require('./modules/moderation/image.js');
const app = express();
const port = process.env.PORT;

const fetcher = new RobloxAssetFetcher();

// Middleware to serve static files from the 'assets' directory
app.use('/assets', express.static('assets'));

// Endpoint to fetch and store an image, then return its path
app.get('/fetchAndStoreImage/:assetId', async (req, res) => {
  const { assetId } = req.params;
  try {
    await fetcher.fetchAndStoreImage(assetId);
    const imagePath = fetcher.getImagePath(assetId);
    res.json({ success: true, imagePath: `/assets/${assetId}.png` });
    res.redirect(`/assets/${assetId}.png`);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
