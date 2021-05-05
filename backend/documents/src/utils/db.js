const MongoClient = require('mongodb')
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage')
const ObjectId = require('mongodb').ObjectId

const dbName = process.env.DB_NAME
const mongoURI =
	`mongodb://` +
	`${process.env.DB_USER}:` +
	`${process.env.DB_PASSWORD}@` +
	`${process.env.DB_HOST}:` +
	`${process.env.DB_PORT}/` +
	`${dbName}`

let storage = new GridFsStorage({
	url: mongoURI,
	options: {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		connectTimeoutMS: 30000,
		keepAlive: 1,
		// auth: { user: process.env.DB_USER, password: process.env.DB_PASSWORD },
	},
	file: (req, file) => {
		console.log(file.originalname)
		// const match = ['application/pdf', 'image/jpeg']

		// if (match.indexOf(file.mimetype) === -1) {
		// 	console.log('Unsupported filetype:' + file.mimetype)
		// 	const filename = `${Date.now()}-${file.originalname}`
		// 	return filename
		// }

		return {
			bucketName: 'docs',
			filename: `${Date.now()}-${file.originalname}`,
			metadata: {
				user_id: parseInt(req.params.uid),
				originalname: file.originalname,
			},
		}
	},
})

const upload = multer({ storage: storage })

const getFiles = (req, res) => {
	//Connect to the MongoDB client
	MongoClient.connect(mongoURI, async (err, client) => {
		if (err) {
			res.status(500).send({
				error: 'Uploaded Error: MongoClient Connection error',
				message: err.errMsg,
			})
		}

		const db = client.db(dbName)

		const collection = db.collection('docs.files')

		let fileList = await collection
			.find({ 'metadata.user_id': parseInt(req.params.uid) })
			.toArray()

		res.status(201).send(fileList)
	})
}

const getFileById = (req, res) => {
	//Connect to the MongoDB client

	MongoClient.connect(mongoURI, (err, client) => {
		if (err) {
			res.status(500).send({
				error: 'Uploaded Error: MongoClient Connection error',
				message: err.errMsg,
			})
		}

		const db = client.db(dbName)

		const collection = db.collection('docs.files')
		const collectionChunks = db.collection('docs.chunks')

		const doc_id = new ObjectId(req.params.id)

		collection.find({ _id: doc_id }).toArray((err, docs) => {
			if (err) {
				res.status(500).send({
					error: 'Download Error: Error finding file',
					message: err.errMsg,
				})
			}
			if (!docs || docs.length === 0) {
				res.status(400).send({
					error: "Download Error: File doesn't exist",
				})
			} else {
				//Retrieving the chunks from the db
				collectionChunks
					.find({ files_id: docs[0]._id })
					.sort({ n: 1 })
					.toArray((err, chunks) => {
						if (err) {
							res.status(500).send({
								error: 'Download Error: Missing chunks',
								message: err.errmsg,
							})
						}
						if (!chunks || chunks.length === 0) {
							//No data found
							res.status(500).send({
								error: 'Download Error: No data found',
							})
						}

						let fileData = []
						for (let i = 0; i < chunks.length; i++) {
							fileData.push(chunks[i].data.toString('base64'))
						}

						//Display the chunks using the data URI format
						let finalFile =
							'data:' +
							docs[0].contentType +
							';base64,' +
							fileData.join('')

						res.status(200).send({
							metadata: docs[0].metadata,
							imgurl: finalFile,
						})
					})
			}
		})
	})
}

module.exports = { upload, getFiles, getFileById }
