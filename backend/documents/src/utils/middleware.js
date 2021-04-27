const util = require('util')
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage')

const mongoURI = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/admin`
// const mongoURI = `mongodb://localhost:${process.env.DB_PORT}`

var storage = new GridFsStorage({
	url: mongoURI,
	options: {
		useNewUrlParser: true,
		useUnifiedTopology: true,
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

var uploadFile = multer({ storage: storage }).single('file')
var uploadFilesMiddleware = util.promisify(uploadFile)
module.exports = uploadFilesMiddleware
