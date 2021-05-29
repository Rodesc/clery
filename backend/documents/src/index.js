const express = require('express')
const { upload, getFiles, getFileById, deleteFileById } = require('./utils/db')
const app = express()

app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader(
		'Access-Control-Allow-Methods',
		'OPTIONS, GET, POST, PUT, PATCH, DELETE'
	) // allowed methods
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
app.use(express.urlencoded({ extended: false }))

const port = process.env.port || 80

app.get('/status', (req, res) => {
	console.log(`get request`)
	res.status(200).send({ status: 'ok' })
})

/**
 * Upload a file using GridFS in MongoDB
 */
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

/**
 * Get file history (metadata) of user with id: uid
 */
app.get('/files/:uid', getFiles)

/**
 * Download file with id: id
 */
app.get('/file/:id', getFileById)

/**
 * Delete the file witd id: id
 */
app.delete('/file/:id', deleteFileById)

// start the Express server
app.listen(port, () => {
	console.log(`Listening for requests (internal port ${port})`)
})
