const express = require('express')
const upload = require('./utils/middleware')
const app = express()

app.use(express.urlencoded()) // parse application/json
app.use(express.json())

const port = process.env.port || 80

// define a route handler for the default home page
app.get('/status', (req, res) => {
	console.log(`get request`)
	res.status(200).send({ status: 'ok' })
})

app.post('/file', async (req, res) => {
	try {
		await upload(req, res)

		console.log(req.file)
		if (req.file == undefined) {
			return res.send(`You must select a file.`)
		}

		return res.send(`File has been uploaded.`)
	} catch (error) {
		console.log(error)
		return res.send(`Error when trying upload image: ${error}`)
	}
})

// start the Express server
app.listen(port, () => {
	console.log(`Listening for requests (internal port ${port})`)
})
