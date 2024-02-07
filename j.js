const https = require('https');
const fs = require('fs');
const path = require('path');

const options = {
  hostname: 'assetdelivery.roblox.com',
  port: 443,
  path: '/v2/assetId/36214639?skipSigningScripts=false',
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate',
  }
};

// Function to handle the HTTPS GET request
function httpsGet(url, callback) {
  https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      callback(null, data);
    });
  }).on('error', (err) => {
    callback(err);
  });
}

// Function to download image
function downloadImage(imageUrl, filename, callback) {
  https.get(imageUrl, (res) => {
    const filePath = path.join(__dirname, filename+'.png');
    const fileStream = fs.createWriteStream(filePath);
    res.pipe(fileStream);
    fileStream.on('finish', () => {
      fileStream.close();
      console.log('Downloaded image:', filename);
      callback(null);
    });
  }).on('error', (err) => {
    callback(err);
  });
}

// Start the first request
httpsGet(options, (err, result) => {
  if (err) {
    console.error('Error during HTTP GET request:', err.message);
    return;
  }
  try {
    const parsedData = JSON.parse(result);

    // Use the 'locations' array from the parsedData
    parsedData.locations.forEach((locationObject) => {
      const imageUrl = locationObject.location;
      const filename = imageUrl.split('/').pop(); // Extract the file name from URL

      // Download the image
      downloadImage(imageUrl, filename, (downloadErr) => {
        if (downloadErr) {
          console.error('Error downloading image:', downloadErr.message);
        }
      });
    });

  } catch (parseErr) {
    console.error('Error parsing JSON:', parseErr.message);
  }
});
