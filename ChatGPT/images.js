const https = require('https');
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function bufferToStream(buffer) {
    const Readable = require('stream').Readable;
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
    try {
        if (fs.existsSync(dirname)) {
            return true;
        }
        fs.mkdirSync(dirname, { recursive: true });
    } catch (err) {
        console.error('Error creating directory:', err.message);
        throw err;
    }
}

function main(assetId, callback) {
    const options = getOptions(assetId);

    https.get(options, (response) => {
        handleResponse(response, (err, data) => {
            if (err) {
                console.error('Error during HTTP GET request:', err.message);
                return callback(err);
            }

            // Encode the image data as base64
            const imageDataBase64 = data.toString('base64');
            
            // Prepare the JSON data
            const configData = {
                imageData: imageDataBase64
            };

            // Define the path for the config.json file
            const configFilePath = path.join(__dirname, 'config.json');

            // Ensure directory existence for config.json
            ensureDirectoryExistence(configFilePath);

            // Write the base64 encoded image data to config.json
            fs.writeFile(configFilePath, JSON.stringify(configData, null, 2), 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error('Error writing to config.json:', writeErr.message);
                    return callback(writeErr);
                }

                console.log(`Image data has been encoded and saved to ${configFilePath}`);
                callback(null, configFilePath);
            });
        });
    }).on('error', (err) => {
        console.error('Error making HTTPS request:', err.message);
        callback(err);
    });
}

module.exports.get_image = main;
