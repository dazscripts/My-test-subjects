const express = require('express')
const app = express()
const { get_binary } = require('../ChatGPT/images.js');

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


get_binary(req.params.id, (err, imageData) => {
    if (err) {
        console.error('An error occurred:', err.message);
    } else {
        // Here imageData is a Buffer containing the binary data of the image
        // You can now work with this Buffer, save it to a file, send it over HTTP, etc.
        console.log('Binary data of image received:', imageData);
    }
});

})
app.get('/api/appeals/:id', (req, res) => {
    const appeal = appeals.find(c => c.id === parseInt(req.params.id))
    if (!appeal) res.status(404).send("Appeal not found")
    else res.status(200).send(appeal)
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on PORT: ${port}`))

 










