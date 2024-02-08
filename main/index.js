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
    if (req.params.pswrd === process.env.password) {} else {return "ACCESS DENIED"}
    get_image(req.params.id, (err, imageData) => {
        if (err) {
            console.error('An error occurred while fetching the image:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        //res.setHeader('Content-Type', 'image/png');
        res.send(imageData);
    });
});

app.use('/api/storage', express.static(path.join(__dirname, '../ChatGPT/storage')));

app.get('/api/storage/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    const imagePath = path.resolve(__dirname, '../ChatGPT/storage', `${imageName}`);

    res.sendFile(imagePath, err => {
        if (err) {
            console.error(err);
            return res.status(404).send('Image not found');
        }
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
