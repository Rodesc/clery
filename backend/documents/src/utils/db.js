const util = require('util')
const { MongoClient } = require('mongodb')
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage')

const mongoURI = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}`

var storage = new GridFsStorage({
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
			const filename = `${Date.now()}-clery-${file.originalname}`
			return filename
		}

		return {
			bucketName: 'documents',
			filename: `${Date.now()}-clery-${file.originalname}`,
		}
	},
})

// Create a new MongoClient
const client = new MongoClient(mongoURI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
})

const getFiles = async (req, res) => {
	try {
		// Connect the client to the server
		await client.connect()

		const database = client.db('test')
		const documents = database.collection('documents')

		const query = {}

		const cursor = documents.find(query)
		// print a message if no documents were found
		if ((await cursor.count()) === 0) {
			res.status(200).send({
				message: 'No documents found',
				documents: [],
			})
		}
		// replace console.dir with your callback to access individual elements
		await cursor.forEach(console.log)
	} finally {
		// Ensures that the client will close when you finish/error
		await client.close()
	}
}

const upload = multer({ storage: storage })
// var uploadFilesMiddleware = util.promisify(uploadFile)
module.exports = { upload, getFiles }
