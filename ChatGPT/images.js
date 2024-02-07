const https = require('https');
const zlib = require('zlib');

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
                        callback(null, imageData);
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

module.exports.get_binary = main;
