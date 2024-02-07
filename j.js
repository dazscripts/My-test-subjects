const https = require('https');
const fs = require('fs');
const zlib = require('zlib');
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

function handleResponse(response, callback) {
  const encoding = response.headers['content-encoding'];

  let data = [];
  let dataStream = response;

  if (encoding === 'gzip') {
    const gzip = zlib.createGunzip();
    response.pipe(gzip);
    dataStream = gzip;
  }

  dataStream.on('data', (chunk) => {
    data.push(chunk);
  });

  dataStream.on('end', () => {
    const combinedData = Buffer.concat(data);
    callback(null, combinedData);
  });

  dataStream.on('error', (err) => {
    callback(err);
  });
}

function downloadImage(url, filename, callback) {
  https.get(url, (response) => {
    handleResponse(response, (err, data) => {
      if (err) {
        callback(err);
        return;
      }

      fs.writeFile(filename, data, 'binary', (err) => {
        if (err) {
          callback(err);
        } else {
          console.log(`Image saved as ${filename}`);
          console.log(data)
          callback(null);
        }
      });
    });
  }).on('error', (err) => {
    callback(err);
  });
}

https.get(options, (response) => {
  handleResponse(response, (err, data) => {
    if (err) {
      console.error('Error during HTTP GET request:', err.message);
      return;
    }

    try {
      const parsedData = JSON.parse(data);

      const imageUrl = parsedData.locations[0].location;
      const filename = 'image.png';
      
      downloadImage(imageUrl, filename, (downloadErr) => {
        if (downloadErr) {
          console.error('Error downloading image:', downloadErr.message);
        }
      });

    } catch (parseErr) {
      console.error('Error parsing JSON:', parseErr.message);
    }
  });
});
