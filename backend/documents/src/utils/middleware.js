const MongoClient = require('mongodb')
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage')

const dbName = process.env.DB_NAME
const mongoURI = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${dbName}`

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
		const match = ['image/png', 'image/jpeg']

		if (match.indexOf(file.mimetype) === -1) {
			const filename = `${Date.now()}-${file.originalname}`
			return filename
		}

		return {
			bucketName: 'docs',
			filename: `${Date.now()}-${file.originalname}`,
			metadata: { user_id: 'id', originalname: file.originalname },
		}
	},
})

const upload = multer({ storage: storage })

const getFiles = (req, res) => {
	console.log('getFiles')
	//Connect to the MongoDB client
	MongoClient.connect(mongoURI, (err, client) => {
		if (err) {
			return res.render('index', {
				title: 'Uploaded Error',
				message: 'MongoClient Connection error',
				error: err.errMsg,
			})
		}
		const db = client.db(dbName)
		const collection = db.collection('docs.files')
		const collectionChunks = db.collection('docs.chunks')
		collection
			.find({}) // QUERY HERE
			.toArray((err, docs) => {
				if (err) {
					return res.status(403).send({
						title: 'File error',
						message: 'Error finding file',
						error: err.errMsg,
					})
				}
				if (!docs || docs.length === 0) {
					return res.status(403).send({
						title: 'Download Error',
						message: 'No file found',
					})
				} else {
					//Retrieving the chunks from the db
					collectionChunks
						.find({ files_id: docs[0]._id })
						.sort({ n: 1 })
						.toArray(function (err, chunks) {
							if (err) {
								res.status(500).send({
									title: 'Download Error',
									message: 'Error retrieving chunks',
									error: err.errmsg,
								})
							}
							if (!chunks || chunks.length === 0) {
								//No data found
								res.status(500).send({
									title: 'Download Error',
									message: 'No data found',
								})
							}

							let fileData = []
							for (let i = 0; i < chunks.length; i++) {
								//This is in Binary JSON or BSON format, which is stored
								//in fileData array in base64 endocoded string format

								fileData.push(chunks[i].data.toString('base64'))
							}

							//Display the chunks using the data URI format
							let finalFile =
								'data:' +
								docs[0].contentType +
								';base64,' +
								fileData.join('')
							res.status(201).send({
								title: 'File',
								message: 'Image loaded from MongoDB GridFS',
								docurl: finalFile,
							})
						})
				}
			})
	})
}

module.exports = { upload, getFiles }
