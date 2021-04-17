const express = require('express')

const app = express()

app.use(express.urlencoded()); // parse application/json
app.use(express.json())

const port = process.env.port || 80

// define a route handler for the default home page
app.get('/status', (req, res) => {
	console.log(`get request`)
	res.status(200).send({status:'ok'})
})

// start the Express server
app.listen(port, () => {
	console.log(`Listening for requests (internal port ${port})`)
})
