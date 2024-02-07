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

// Function to download content
function downloadContent(contentUrl, filename, callback) {
  https.get(contentUrl, (res) => {
    const filePath = path.join(__dirname, filename);
    const fileStream = fs.createWriteStream(filePath);

    res.pipe(fileStream);

    fileStream.on('finish', () => {
      fileStream.close();
      console.log('Downloaded content:', filename);
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
      const contentUrl = locationObject.location;
      const filename = 'downloaded_content.png'; // You can choose a suitable filename or derive from contentUrl

      // Download the content
      downloadContent(contentUrl, filename, (downloadErr) => {
        if (downloadErr) {
          console.error('Error downloading content:', downloadErr.message);
        }
      });
    });

  } catch (parseErr) {
    console.error('Error parsing JSON:', parseErr.message);
  }
});
