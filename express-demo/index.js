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

app.post('/api/appeals/:id', (req, res) => {
    const appeal = {
        id: req.params.id
    }
})

app.get('/api/appeals/:id', (req, res) => {
    const appeal = appeals.find(c => c.id === parseInt(req.params.id))
    if (!appeal) res.status(404).send("Appeal not found")
    else res.status(200).send(appeal)
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on PORT: ${port}`))

 










