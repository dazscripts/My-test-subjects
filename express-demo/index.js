const express = require('express')
const app = express()
const fs = require('fs');
const path = require('path');
const { get_image } = require('../ChatGPT/images.js');

app.use(express.json())

const appeals = [
    {id : 1},
    {id:2}
]

app.get('/', (req, res) => {
    res.send('gg ez')
})

app.get('/api/appeals', (req, res) => {
    res.send(appeals)
})
const endpoints = {
    "endpoints":"/api",
    "appeals list": "/api/appeals",
    "search for an appeal": "/api/appeals/{id}",
}

app.get('/api', (req, res) => {
    res.status(200)
    res.send(endpoints)
})
app.get('/api/bytecode/:id', (req, res) => {
    get_image(parseInt(req.params.id), (err, imageStream) => {
        if (err) {
            console.error('An error occurred while fetching the image:', err);
            return;
        }
    
        res.setHeader('Content-Type', 'image/png'); // Adjust the content type as needed

        // Pipe the image stream directly to the response
        imageStream.pipe(res);

        // Handle errors during stream processing
        imageStream.on('error', (err) => {
            console.error('Error processing image stream:', err);
            res.status(500).json({ error: 'Internal server error' });
        });
    
        
    });



})

app.use('/api/storage', express.static('../ChatGPT/storage'));
console.log(__dirname)
app.get('/api/storage/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    const imagePath = path.join('../', 'ChatGPT', 'storage', imageName);

    res.sendFile(`../ChatGPT/storage${imageName}.png`, err => {
        if (err) {
            console.error(err);
            res.status(404).send('Image not found');
        }
    });
});

app.get('/api/appeals/:id', (req, res) => {
    const appeal = appeals.find(c => c.id === parseInt(req.params.id))
    if (!appeal) res.status(404).send("Appeal not found")
    else res.status(200).send(appeal)
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on PORT: ${port}`))

 










