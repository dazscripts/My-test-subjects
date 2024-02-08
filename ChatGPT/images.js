const fs = require('fs');
const path = require('path');

/**
 * Encodes an image file to Base64 and saves the encoded string to a config.json file.
 * 
 * @param {string} imageFilePath Path to the image file to be encoded.
 */
function encodeImageToBase64AndSave(imageFilePath) {
    fs.readFile(imageFilePath, (err, imageData) => {
        if (err) {
            console.error('Error reading the image file:', err);
            return;
        }

        // Encode the image data to Base64
        const imageBase64 = imageData.toString('base64');
        
        // Construct the data URI, assuming the image is a PNG
        // You might want to adjust the MIME type based on your actual image type
        const imageDataUri = `data:image/png;base64,${imageBase64}`;

        // Prepare the object to be saved in JSON format
        const configData = {
            imageData: imageDataUri
        };

        // Define the path for the config.json file
        const configFilePath = path.join(__dirname, 'config.json');

        // Write the Base64 encoded image data to config.json
        fs.writeFile(configFilePath, JSON.stringify(configData, null, 2), 'utf8', (err) => {
            if (err) {
                console.error('Error writing to config.json:', err);
                return;
            }
            console.log('Image has been encoded and saved to config.json successfully.');
        });
    });
}

module.exports.get_image = encodeImageToBase64AndSave
