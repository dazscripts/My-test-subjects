const https = require('https');
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const imageType = require('image-type'); // Make sure to install this package

function bufferToStream(buffer) {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    return stream;
}

function getOptions(assetId) {
    return {
        hostname: 'assetdelivery.roblox.com',
        port: 443,
        path: `/v2/assetId/${assetId}?skipSigningScripts=false`,
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip, deflate',
        }
    };
}

function handleResponse(response, callback) {
    const encoding = response.headers['content-encoding'];
    let dataStream = response;

    if (encoding === 'gzip') {
        const gzip = zlib.createGunzip();
        response.pipe(gzip);
        dataStream = gzip;
    }

    const chunks = [];
    dataStream.on('data', (chunk) => {
        chunks.push(chunk);
    });

    dataStream.on('end', () => {
        const combinedData = Buffer.concat(chunks);
        callback(null, combinedData);
    });

    dataStream.on('error', (err) => {
        callback(err);
    });
}

function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    fs.mkdirSync(dirname, { recursive: true });
}

function main(assetId, callback) {
    const options = getOptions(assetId);

    https.get(options, (response) => {
        handleResponse(response, (err, data) => {
            if (err) {
                console.error('Error during HTTP GET request:', err.message);
                return callback(err);
            }

            try {
                const parsedData = JSON.parse(data.toString());
                const imageUrl = parsedData.locations[0].location;

                https.get(imageUrl, (imageResponse) => {
                    handleResponse(imageResponse, (downloadErr, imageData) => {
                        if (downloadErr) {
                            console.error('Error downloading image:', downloadErr.message);
                            return callback(downloadErr);
                        }
                        
                        // Determine the image format from the downloaded data
                        const imageFormat = imageType(imageData);
                        if (!imageFormat) {
                            console.error('Could not determine image format.');
                            return callback(new Error('Could not determine image format.'));
                        }
                        
                        const filename = `${assetId}.${imageFormat.ext}`; 
                        const filePath = path.join(__dirname, 'storage', filename);

                        ensureDirectoryExistence(filePath);

                        fs.writeFile(filePath, imageData, (writeErr) => {
                            if (writeErr) {
                                console.error('Error writing image to file:', writeErr.message);
                                return callback(writeErr);
                            }
                            
                            console.log(`Image saved as ${filename} to ${filePath}`);
                            callback(null, filePath); 
                        });
                    });
                }).on('error', (err) => {
                    console.error('Error making HTTPS request:', err.message);
                    callback(err);
                });

            } catch (parseErr) {
                console.error('Error parsing JSON:', parseErr.message);
                callback(parseErr);
            }
        });
    }).on('error', (err) => {
        console.error('Error making HTTPS request:', err.message);
        callback(err);
    });
}

module.exports.get_image = main;
