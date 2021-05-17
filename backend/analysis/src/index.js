const express = require('express')
const { Db } = require('mongodb')
const multer = require('multer')
const { getSource } = require('./utils/db')
const {
	extractText,
	findKeywords,
	findRefs,
	findSourcesAsync,
} = require('./utils/middleware')

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

app.use(express.urlencoded({ extended: true })) // parse application/json
app.use(express.json())

const port = process.env.port || 80

const upload = multer({ storage: multer.memoryStorage() }).single('file')

app.get('/status', (req, res) => {
	res.status(200).send({ status: 'ok' })
})

app.post('/analysis', upload, extractText, findSourcesAsync, (req, res) => {
	res.status(200).send(req.resAnalysis)
})

app.get('/source', (req, res) => {
	console.log('getting source')
	console.log(req.query)
	console.log('get source: ' + req.query.id)
	getSource(req.query.id, (source) => {
		res.status(200).send(source)
	})
})

// start the Express server
app.listen(port, () => {
	console.log(`Listening for requests (internal port ${port})`)
})

process.on('uncaughtException', function (err) {
	console.log(err)
})
