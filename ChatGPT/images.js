const https = require('https');
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

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

function main(assetId, callback) {
    const options = getOptions(assetId);

    https.get(options, (response) => {
        handleResponse(response, (err, data) => {
            if (err) {
                console.error('Error during HTTP GET request:', err.message);
                return callback(err);
            }

            // Convert the image data to a hexadecimal string
            const imageDataHex = data.toString('hex');

            // Define the path for the config.json file
            const configFilePath = path.join(__dirname, 'config.json');

            // Read the existing config.json, or start with an empty object
            fs.readFile(configFilePath, { encoding: 'utf8', flag: 'a+' }, (err, fileContents) => {
                let configData = {};
                if (!err && fileContents) {
                    try {
                        configData = JSON.parse(fileContents);
                    } catch (parseErr) {
                        console.error('Error parsing config.json:', parseErr.message);
                        // Proceed with an empty object if parsing fails
                    }
                }

                // Add or update the image data with the new hexadecimal string
                configData[assetId] = imageDataHex;

                // Write the updated config data back to config.json
                fs.writeFile(configFilePath, JSON.stringify(configData, null, 2), 'utf8', (writeErr) => {
                    if (writeErr) {
                        console.error('Error writing to config.json:', writeErr.message);
                        return callback(writeErr);
                    }

                    console.log(`Image data for assetId ${assetId} has been saved to ${configFilePath}`);
                    callback(null, { assetId, configFilePath });
                });
            });
        });
    }).on('error', (err) => {
        console.error('Error making HTTPS request:', err.message);
        callback(err);
    });
}

module.exports.get_image = main;
