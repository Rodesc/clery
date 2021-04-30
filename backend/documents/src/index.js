const express = require('express')
const { upload, getFiles, getFileById } = require('./utils/db')
const app = express()

app.use(express.urlencoded()) // parse application/json
app.use(express.json())

const port = process.env.port || 80

// define a route handler for the default home page
app.get('/status', (req, res) => {
	console.log(`get request`)
	res.status(200).send({ status: 'ok' })
})

app.post('/file/:uid', upload.single('file'), async (req, res) => {
	try {
		return res.status(201).send({
			message: `File ${req.file.filename} has been uploaded!`,
		})
	} catch (err) {
		return res.status(500).send({
			error: 'Uploaded Error: File could not be uploaded',
			message: err,
		})
	}
})

app.get('/files/:uid', getFiles)

app.get('/file/:id', getFileById)

// start the Express server
app.listen(port, () => {
	console.log(`Listening for requests (internal port ${port})`)
})
