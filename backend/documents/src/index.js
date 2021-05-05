const express = require('express')
const { upload, getFiles, getFileById, deleteFileById } = require('./utils/db')
const app = express()

app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*') // to enable calls from every domain
	res.setHeader(
		'Access-Control-Allow-Methods',
		'OPTIONS, GET, POST, PUT, PATCH, DELETE'
	) // allowed actiosn
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Content-Type, Authorization,X-Requested-With'
	)
	res.setHeader('Access-Control-Allow-Credentials', true)

	if (req.method === 'OPTIONS') {
		return res.sendStatus(200) // to deal with chrome sending an extra options request
	}
	next()
})
app.use(express.json())
app.use(express.urlencoded({ extended: false })) // parse application/json

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

app.delete('/file/:id', deleteFileById)

// start the Express server
app.listen(port, () => {
	console.log(`Listening for requests (internal port ${port})`)
})
