const storeFile = async (req, res, next) => {
	console.log('storeFile')
	req.resAnalysis = {}

	// const data = new FormData()
	// console.log(req.file)
	// data.append('file', fs.createReadStream(req.file.path))

	// Reflect.ownKeys(req.body).forEach((key) => {
	// 	console.log(key)
	// 	data.append(key, req.body[key])
	// })

	// // let config = {
	// // 	headers: {
	// // 		Authorization: req.header('Authorization'),
	// // 		...data.getHeaders(),
	// // 	},
	// // }
	// let config = {
	// 	headers: req.headers,
	// }

	// const auth = await axios.get('http://gateway/auth/', config)
	// const payload = auth.data.payload

	// const response2 = await axios.post(
	// 	`http://documents/file/${payload.user_id}`,
	// 	req.body,
	// 	config
	// )
	// console.log('response2')
	// console.log(response2.data)
	next()
}

var textract = require('textract')

const extractText = async (req, res, next) => {
	console.log('extractText')
	const config = {
		preserveLineBreaks: true,
		preserveOnlyMultipleLineBreaks: true,
	}
	textract.fromBufferWithMime(
		req.file.mimetype,
		req.file.buffer,
		config,
		(error, fileContent) => {
			if (error) {
				console.log(error)
				console.log(fileContent)
				res.status(500).send({
					error: 'Error extracting text from document',
					message: error,
				})
			}

			req.resAnalysis.fileContent = fileContent
			// console.log(req.resAnalysis)
			next()
		}
	)
}
// const translate = require('deepl')
const DEEPL_API_KEY = process.env.DEEPL_API_KEY

const axios = require('axios')
const querystring = require('querystring')

const translateToEn = async (sentence) => {
	async function translate(parameters) {
		return axios.post(
			`https://api-free.deepl.com/v2/translate`,
			querystring.stringify(parameters)
		)
	}

	translate({
		auth_key: DEEPL_API_KEY,
		text: sentence,
		target_lang: 'EN',
		split_sentences: '0',
		preserve_formatting: '1',
	})
		.then((result) => {
			console.log(result.data)
			return result.data.translations[0].text
		})
		.catch((error) => {
			console.error(error)
		})
}

const OpenAI = require('openai-api')
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const openai = new OpenAI(OPENAI_API_KEY)

const matchWithKeywords = async (sentenceEN) => {
	const gptResponse = await openai.search({
		engine: 'davinci',
		documents: ['Maison Blanche', 'hopital', 'école'],
		query: sentenceEN,
	})
	console.log(gptResponse.data)
	return gptResponse.data
}

const findKeywords = async (req, res, next) => {
	console.log('findKeywords')
	const text = req.resAnalysis.fileContent
	var exp = /["']?[A-Z][^.?!]+((?![.?!]['"]?\\s["']?[A-Z][^.?!]).)+[.?!'"]+/
	var rx = /[^\.!\?]+[\.!\?]+/g
	var sentences = text.match(rx)
	let sentenceObjectList = []
	await sentences.forEach(async (s) => {
		console.log(s)
		// translate to english
		// match sentence with pre established keywords GPT3
		// get match keyword
		let translation = await translateToEn(s)
		let keywordList = await matchWithKeywords(s)

		sentenceObjectList.push({
			sentence: s,
			keywords: keywordList,
			translation: translation,
		})
	})
	req.resAnalysis.sentences = sentenceObjectList
	console.log('Sentences :' + sentences.length.toString())

	next()
}

const findRefs = async (req, res, next) => {
	console.log('findRefs')
	next()
}

module.exports = {
	storeFile,
	extractText,
	findKeywords,
	findRefs,
}
