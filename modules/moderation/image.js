const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

class RobloxAssetFetcher {
  constructor() {
    this.assets = {};
  }

  async fetchAndStoreImage(assetId) {
    try {
      const url = `https://assetdelivery.roblox.com/v1/asset/?id=${assetId}`;
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');
      const imagePath = path.join(__dirname, 'assets', `${assetId}.png`);
      await sharp(buffer).toFile(imagePath);
      this.assets[assetId] = imagePath;
      console.log(`Image saved: ${imagePath}`);
    } catch (error) {
      console.error('Failed to fetch and store image:', error);
    }
  }

  getImagePath(assetId) {
    return this.assets[assetId] || null;
  }
}

module.exports = RobloxAssetFetcher;
