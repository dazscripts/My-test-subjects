const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const { get_image } = require('../ChatGPT/images.js');
const mod = require('../ChatGPT/moderation.js')

app.use(express.json());

const appeals = [
    { id: 1 },
    { id: 2 }
];

app.get('/', (req, res) => {
    res.send('gg ez');
});

app.get('/api/appeals', (req, res) => {
    res.send(appeals);
});

const endpoints = {
    "endpoints": "/api",
    "appeals list": "/api/appeals",
    "search for an appeal": "/api/appeals/{id}",
};

app.get('/api', (req, res) => {
    res.status(200).send(endpoints);
});

app.get('/api/bytecode/:id-:pswrd', (req, res) => {
    if (req.params.pswrd !== process.env.password) {
        return res.status(403).send("ACCESS DENIED");
    }

    // Assuming 'config.json' is in the same directory as your script
    const configPath = path.join(__dirname, '../ChatGPT', 'storage.json');
    fs.readFile(configPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading config.json:', err);
            return res.status(500).send('Error loading image data');
        }

        const config = JSON.parse(data);
        const imageDataBase64 = config.imageData;
        if (!imageDataBase64) {
            return res.status(404).send('No image data found');
        }

        // Extract base64 data from the URI scheme if present
        const base64Data = imageDataBase64.split(';base64,').pop();
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': Buffer.byteLength(base64Data, 'base64')
        });
        res.end(Buffer.from(base64Data, 'base64'));
    });
});


app.use('/api/storage', express.static(path.join(__dirname, '../ChatGPT/storage')));

app.get('/api/storage/:id', (req, res) => {
    const assetId = req.params.id;
    const configFilePath = path.join(__dirname, 'config.json');

    fs.readFile(configFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Failed to read config.json:', err);
            return res.status(500).send('Internal server error');
        }

        const config = JSON.parse(data);
        const imageDataHex = config[assetId];

        if (!imageDataHex) {
            return res.status(404).send('Image not found');
        }

        // Convert hexadecimal string back to binary data
        const imageData = Buffer.from(imageDataHex, 'hex');

        res.writeHead(200, {
            'Content-Type': 'image/png', // Assume PNG format; adjust if necessary
            'Content-Length': imageData.length
        });
        res.end(imageData);
    });
});
    
app.get('/api/appeals/:id', (req, res) => {
    const appeal = appeals.find(c => c.id === parseInt(req.params.id));
    if (!appeal) return res.status(404).send("Appeal not found");
    res.status(200).send(appeal);
});

app.get('/api/moderation/:type/:input-:pswrd', (req,res) => {
    if (req.params.type === "image"){
        mod.image(parseInt(req.params.input),req.params.pswrd, res)
        

    }else if (req.params.type === "text") {
        mod.text(req.params.input, req.params.pswrd, res)
        

    }
})

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on PORT: ${port}`));
