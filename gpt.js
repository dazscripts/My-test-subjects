const { get_binary } = require('./ChatGPT/images.js');

get_binary(36214639, (err, imageData) => {
    if (err) {
        console.error('An error occurred:', err.message);
    } else {
        // Here imageData is a Buffer containing the binary data of the image
        // You can now work with this Buffer, save it to a file, send it over HTTP, etc.
        console.log('Binary data of image received:', imageData);
    }
});
