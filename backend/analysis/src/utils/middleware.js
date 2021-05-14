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
			next()
		}
	)
}

const DEEPL_API_KEY = process.env.DEEPL_API_KEY

const axios = require('axios')
const querystring = require('querystring')

const translateToEn = async (sentence) => {
	function translate(parameters) {
		return axios.post(
			`https://api-free.deepl.com/v2/translate`,
			querystring.stringify(parameters)
		)
	}

	try {
		const result = await translate({
			auth_key: DEEPL_API_KEY,
			text: sentence,
			target_lang: 'EN',
			split_sentences: '0',
			preserve_formatting: '1',
		})
		return result.data.translations[0].text
	} catch (err) {
		console.error(error)
	}
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const matchWithKeywords = async (sentenceEN) => {
	try {
		const data = {
			file: 'file-jj9YN7GJs6xF8ay9ERmsFy3g', // small: file-fd3kYLtD6dynAzM0vwM2VLaw
			query: sentenceEN,
			return_metadata: true,
		}

		const config = {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${OPENAI_API_KEY}`,
			},
		}

		const gptResponse = await axios.post(
			'https://api.openai.com/v1/engines/babbage/search',
			data,
			config
		)
		return gptResponse.data.data
	} catch (err) {
		console.log(err.response)
		console.log('error retrieving data')
		return {}
	}
}

const findKeywords = async (req, res, next) => {
	const text = req.resAnalysis.fileContent

	const exp = /["']?[A-Z][^.?!]+((?![.?!]['"]?\\s["']?[A-Z][^.?!]).)+[.?!'"]+/
	const rx = /[^\.!\?]+[\.!\?]+/g
	const sentences = text.match(rx) //TODO améliorer detection de phrases

	let sentenceObjectList = []

	for (var i = 0; i < sentences.length; i++) {
		// take three sentences each time to reduce costs
		// that doesn't seem to word, no match with keywords GPT-3
		const sentence = sentences[i] // + '\n' + sentences[i + 1] + '\n' + sentences[i + 2]

		const translation = await translateToEn(sentence)

		let keywordList = await matchWithKeywords(translation)

		// sort and clean each object of keywordList
		keywordList.sort((a, b) => parseFloat(b.score) - parseFloat(a.score))

		keywordList = keywordList
			.slice(0, 10) //only take 10 best keywords
			.filter((obj) => {
				return obj.score >= 80
			})
			.map((obj) => {
				let newObj = {}
				newObj.keyword = obj.metadata.original
				newObj.keywordEN = obj.text
				newObj.language = obj.metadata.source_lang
				newObj.score = obj.score
				return newObj
			})

		sentenceObjectList.push({
			sentence: sentence,
			keywords: keywordList,
		})
	}

	req.resAnalysis.sentences = sentenceObjectList

	next()
}

const db = require('./db')

const findRefs = async (req, res, next) => {
	console.log('findRefs')
	// find refs in DB
	const sentences = req.resAnalysis.sentences
	db.findSources(sentences, (newSentences) => {
		req.resAnalysis.sentences = newSentences
		console.log('next')
		next()
	})
}

module.exports = {
	storeFile,
	extractText,
	findKeywords,
	findRefs,
}
