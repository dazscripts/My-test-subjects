const https = require('https');
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');
const fileType = require('file-type');

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

async function getImageExtension(imageData) {
    const result = await fileType.fromBuffer(imageData);
    return result ? result.ext : 'png'; // Default to 'png' if the file type could not be determined
}

async function main(assetId, callback) {
    const options = getOptions(assetId);

    https.get(options, (response) => {
        handleResponse(response, async (err, data) => {
            if (err) {
                console.error('Error during HTTP GET request:', err.message);
                return callback(err);
            }

            const imageExtension = await getImageExtension(data);
            const filename = `${assetId}.${imageExtension}`;
            const filePath = path.join(__dirname, 'storage', filename);

            ensureDirectoryExistence(filePath);

            fs.writeFile(filePath, data, (writeErr) => {
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
}

module.exports.get_image = main;
