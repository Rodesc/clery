/* =========== Text extraction =========== */
const textract = require('textract')

const extractText = async (req, res, next) => {
	// initialise object to send back
	req.resAnalysis = {}

	console.log('Extracting text')
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

			console.log('Extracted text')
			req.resAnalysis.fileContent = fileContent
			next()
		}
	)
}

/* =========== Text translation =========== */
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

/* =========== Keyword extraction and matching =========== */
const MAX_RERANK = 8
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const matchWithKeywords = async (sentenceEN, max_rerank = MAX_RERANK) => {
	try {
		const data = {
			file: 'file-jj9YN7GJs6xF8ay9ERmsFy3g', // small: file-fd3kYLtD6dynAzM0vwM2VLaw
			query: sentenceEN,
			max_rerank: max_rerank,
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
		console.log('Error retrieving data')
		try {
			console.log(err.response.data.error.message)
		} catch (error) {
			console.log(err)
		} finally {
			return []
		}
	}
}

const extractKeywords = async (sentenceEN) => {
	try {
		const engine = 'curie-instruct-beta'
		const data = {
			prompt:
				'Extract keywords from the following text.\n\nText:' +
				sentenceEN +
				'\n\nKeywords:',
			temperature: 0.3,
			max_tokens: 60,
			top_p: 1,
			frequency_penalty: 0.9,
			presence_penalty: 0.9,
			stop: ['\n'],
		}

		const config = {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${OPENAI_API_KEY}`,
			},
		}

		const gptResponse = await axios.post(
			'https://api.openai.com/v1/engines/curie-instruct-beta/completions',
			data,
			config
		)

		console.log(
			'Keywords extracted for \n"' +
				sentenceEN +
				'"\n => ' +
				gptResponse.data.choices[0].text
		)
		const keywords = gptResponse.data.choices[0].text.split(', ')
		return keywords
	} catch (err) {
		console.log('Error retrieving data')
		const message = err.response.data.error.message
		if (message != undefined) {
			console.log(message)
		} else {
			console.log(err)
		}
		return []
	}
}

/* Extract sentences from text */
const nlp = require('./compromise-tokenize')
const extractSentences = (text) => {
	const doc = nlp(text)

	const sentences = doc.json().map((o) => o.text)
	return sentences
}

const findKeywords = async (req, res, next) => {
	const text = req.resAnalysis.fileContent

	const sentences = extractSentences(text)

	let sentenceObjectList = []

	for (var i = 0; i < sentences.length; i++) {
		// take three sentences each time to reduce costs
		// that doesn't seem to word, no match with keywords GPT-3
		const sentence = sentences[i] // + '\n' + sentences[i + 1] + '\n' + sentences[i + 2]

		const translation = await translateToEn(sentence)

		const sentenceKeywords = await extractKeywords(translation)

		let keywordList = []

		for (var j = 0; j < sentenceKeywords.length; j++) {
			keyword = sentenceKeywords[j]
			const matchingKeyWords = await matchWithKeywords(
				keyword,
				// max_rerank =
				Math.max(
					Math.round((MAX_RERANK * 1.0) / sentenceKeywords.length),
					1
				)
			)
			keywordList = keywordList.concat(matchingKeyWords)
		}

		// sort and clean each object of keywordList
		keywordList.sort((a, b) => parseFloat(b.score) - parseFloat(a.score))

		keywordList = keywordList
			.slice(0, MAX_RERANK + 2)
			.filter((obj) => {
				return obj.score >= 120
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

/* =========== Reference finding =========== */
const db = require('./db')

const findRefs = async (req, res, next) => {
	// find refs in DB
	const sentences = req.resAnalysis.sentences
	db.findSources(sentences, (newSentences) => {
		req.resAnalysis.sentences = newSentences
		next()
	})
}

/* =========== NEW ASYNC WAY =========== */
const findSourcesAsync = async (req, res, next) => {
	const text = req.resAnalysis.fileContent

	const sentences = extractSentences(text)

	let sourceObjectPromises = []

	for (var i = 0; i < sentences.length; i++) {
		const promise = findSourcesForSentence(sentences[i])
		sourceObjectPromises.push(promise)
	}

	let sourceObjects = await Promise.all(sourceObjectPromises)

	sourceObjects = sourceObjects.map((sourceArray) => {
		return sourceArray.flat().filter((item, pos, self) => {
			//filter out duplicates
			//this may take a lot of time
			return self.indexOf(item) == pos
		})
	})
	req.resAnalysis.sentences = []
	for (var i = 0; i < sentences.length; i++) {
		const object = {
			sentence: sentences[i],
			sources: sourceObjects[i].flat(),
		}
		req.resAnalysis.sentences.push(object)
	}

	console.log('Done')
	next()
}

const findSourcesForSentence = async (sentence) => {
	// pseudo:
	//		translate sentence to english
	//		extract keywords with gpt3
	// 		match keywords together with gpt3 search
	//		find sources in DB with matching keywords
	console.log('Finding sources for sentence: ' + sentence)
	const translation = await translateToEn(sentence)

	const sentenceKeywords = await extractKeywords(translation)

	let sourcesPromises = []
	for (var j = 0; j < sentenceKeywords.length; j++) {
		keyword = sentenceKeywords[j]

		max_rerank = Math.max(
			Math.round((MAX_RERANK * 1.0) / sentenceKeywords.length),
			1
		)

		const keywordsPromise = matchWithKeywords(keyword, max_rerank)

		sourcesPromises.push(
			db.findSourcesForKeywords(keywordsPromise, keyword)
		)
	}

	return Promise.all(sourcesPromises)
}

module.exports = {
	extractText,
	findKeywords,
	findRefs,
	findSourcesAsync,
}
