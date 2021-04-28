const express = require('express')
const { upload, getFiles } = require('./utils/middleware')
const app = express()

app.use(express.urlencoded()) // parse application/json
app.use(express.json())

const port = process.env.port || 80

// define a route handler for the default home page
app.get('/status', (req, res) => {
	console.log(`get request`)
	res.status(200).send({ status: 'ok' })
})

app.post('/file', upload.single('file'), async (req, res) => {
	try {
		return res.status(201).send({
			title: 'Uploaded',
			message: `File ${req.file.filename} has been uploaded!`,
		})
	} catch (err) {
		return res.status(500).send({
			title: 'Uploaded Error',
			message: 'File could not be uploaded',
			error: err,
		})
	}
})

app.get('/files', getFiles)

// start the Express server
app.listen(port, () => {
	console.log(`Listening for requests (internal port ${port})`)
})
