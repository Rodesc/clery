const express = require('express')
const multer = require('multer')
const {
	storeFile,
	extractText,
	findKeywords,
	findRefs,
} = require('./utils/middleware')

const app = express()

app.use(express.urlencoded({ extended: true })) // parse application/json
app.use(express.json())

const port = process.env.port || 80

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, OPTIONS, PUT, PATCH, DELETE'
	)
	res.setHeader(
		'Access-Control-Allow-Headers',
		'X-Requested-With,content-type'
	)
	res.setHeader('Access-Control-Allow-Credentials', true)
	next()
})

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const upload = multer({ storage: multer.memoryStorage() }).single('file')
// var storage = multer.diskStorage({
// 	destination: function (req, file, cb) {
// 		cb(null, '/tmp/')
// 	},
// })
// const upload = multer({ storage: storage }).single('file')

app.get('/status', (req, res) => {
	res.status(200).send({ status: 'ok' })
})

app.post(
	'/analysis',
	upload,
	storeFile,
	extractText,
	findKeywords,
	findRefs,
	(req, res) => {
		res.status(200).send(req.resAnalysis)
	}
)

// start the Express server
app.listen(port, () => {
	console.log(`Listening for requests (internal port ${port})`)
})

process.on('uncaughtException', function (err) {
	console.log(err)
})
