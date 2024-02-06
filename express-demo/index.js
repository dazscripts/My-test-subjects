const express = require('express')
const app = express()

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
app.get('/api/appeals/:id', (req, res) => {
    const appeal = appeals.find(c => c.id === parseInt(req.params.id))
    if (!appeal) res.status(404).send("Appeal not found")
    else res.status(200).send(appeal)
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on PORT: ${port}`))

 










