const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

class RobloxAssetFetcher {
  constructor() {
    this.assetsDirectory = path.join(__dirname, 'assets');
    fs.ensureDirSync(this.assetsDirectory);
  }

  async fetchImageBuffer(assetId) {
    const url = `https://assetdelivery.roblox.com/v1/asset/?id=${assetId}`;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
  }

  async storeImage(assetId, buffer) {
    const imagePath = path.join(this.assetsDirectory, `${assetId}.png`);
    await sharp(buffer).toFile(imagePath);
    return imagePath;
  }

  getStoredImagePath(assetId) {
    const imagePath = path.join(this.assetsDirectory, `${assetId}.png`);
    if (fs.existsSync(imagePath)) {
      return imagePath;
    }
    return null;
  }
}

module.exports = RobloxAssetFetcher;
