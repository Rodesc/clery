const textract = require('textract')
const db = require('./db')
const axios = require('axios')
const querystring = require('querystring')
const nlp = require('./compromise-tokenize')

const DEEPL_API_KEY = process.env.DEEPL_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const MAX_RERANK = 8

/* =========== Text extraction =========== */
/**
 * Extract the file content from file in request.
 * This is done using the textract package
 */
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
/**
 * Use Deepl to translate a sentence to English
 */
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
		console.error(err)
		return sentence
	}
}

/* =========== Keyword extraction and matching using GPT-3 =========== */
/**
 * Find keywords from DB that match with keyword
 * This is done with GPT-3 semantic search endpoint
 */
const matchWithKeywords = async (keyword, max_rerank = MAX_RERANK) => {
	try {
		const data = {
			file: 'file-1dCvuCIcT9qf3KbH5Yor7QEE', // small: file-fd3kYLtD6dynAzM0vwM2VLaw
			query: keyword,
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

/**
 * Use GPT-3 to extract keywords from a sentence
 * Return a list of keywords
 */
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

/**
 * Extract sentences from continuous string (text)
 * Done with compromise https://github.com/spencermountain/compromise
 */
const extractSentences = (text) => {
	const doc = nlp(text)

	const sentences = doc.json().map((o) => o.text)
	return sentences
}

/**
 * Find sources in an ASYNC way after extracting filecontent
 * Calls next() once all the sentences have been matched with sources
 */
const findSourcesAsync = async (req, res, next) => {
	const text = req.resAnalysis.fileContent

	const sentences = extractSentences(text)

	// Analyse all sentences concurrently
	let sourceObjectPromises = []
	for (var i = 0; i < sentences.length; i++) {
		const promise = findSourcesForSentence(sentences[i])
		sourceObjectPromises.push(promise)
	}
	let sourceObjects = await Promise.all(sourceObjectPromises)

	sourceObjects = sourceObjects.map((sourceArray) => {
		return sourceArray.flat().filter((item, pos, self) => {
			//filter out duplicates
			//this may impact performances
			return self.indexOf(item) == pos
		})
	})

	// map sources with sentences
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

/**
 * Find all sources matching with the sentence and return them
 * The pseudo algorithm works as follows:
 * 		translate sentence to english
 * 		extract keywords with gpt3
 * 		match keywords together with gpt3 search
 *      find sources in DB with matching keywords
 */
const findSourcesForSentence = async (sentence) => {
	console.log('Finding sources for sentence: ' + sentence)

	// translate sentence to english
	const translation = await translateToEn(sentence)
	// extract keywords with gpt3
	const sentenceKeywords = await extractKeywords(translation)

	// for each keyword match with gpt3 search
	let sourcesPromises = []
	for (var j = 0; j < sentenceKeywords.length; j++) {
		keyword = sentenceKeywords[j]

		max_rerank = Math.max(
			Math.round((MAX_RERANK * 1.0) / sentenceKeywords.length),
			1
		)

		// one keyword with the best ones from DB
		const keywordsPromise = matchWithKeywords(keyword, max_rerank)

		// find sources in DB with matching keyword
		sourcesPromises.push(
			db.findSourcesForKeywords(keywordsPromise, keyword)
		)
	}

	return Promise.all(sourcesPromises)
}

module.exports = {
	extractText,
	findSourcesAsync,
}
