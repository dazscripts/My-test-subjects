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
        hostname: 'example.com', 
        port: 443,
        path: `/path/to/image/${assetId}`,
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


function getImageExtension(imageData) {
    const signatures = [
        { bytes: [0xFF, 0xD8, 0xFF], ext: 'jpg' },
        { bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], ext: 'png' },
        { bytes: [0x47, 0x49, 0x46, 0x38], ext: 'gif' }
    ];

    for (let signature of signatures) {
        const match = signature.bytes.every((byte, index) => imageData[index] === byte);
        if (match) {
            return signature.ext;
        }
    }

    return 'png';
}

function main(assetId, callback) {
    const options = getOptions(assetId);

    https.get(options, (response) => {
        handleResponse(response, (err, data) => {
            if (err) {
                console.error('Error during HTTP GET request:', err.message);
                return callback(err);
            }

            const imageExtension = getImageExtension(data);
            const filename = `${assetId}.${imageExtension}`;
            const filePath = path.join(__dirname, 'storage', filename);

            ensureDirectoryExistence(filePath);

            fs.writeFile(filePath, data, (writeErr) => {
                if (writeErr) {
                    console.error('Error writing image to file:', writeErr.message);
                    return callback(writeErr);
                }
                console.log(data)

                console.log(`Image saved as ${filename} to ${filePath}`);
                callback(null, filePath);
            });
        });
    }).on('error', (err) => {
        console.error('Error making HTTPS request:', err.message);
        callback(err);
    });
}

module.exports.get_image = main
