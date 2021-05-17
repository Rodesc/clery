const MongoClient = require('mongodb')

const dbName = process.env.DB_NAME
const mongoURI =
	`mongodb://` +
	`${process.env.DB_USER}:` +
	`${process.env.DB_PASSWORD}@` +
	`${process.env.DB_HOST}:` +
	`${process.env.DB_PORT}/` +
	`${dbName}`

function findSources (sentences, callback) {
	const newSentences = sentences
	console.log("Finding sources ...")

	const projection = {'fields.Title': 1, 'fields.FinFisconetDispSummary':1 }

	MongoClient.connect(mongoURI, async (err, client) => {
		if (err) {
			console.log('MongoClient Connection error')
			console.log(err)
			callback(sentences)
		}
		for (var i = 0; i < sentences.length; i++) {
			const keywords = sentences[i].keywords
			let sourceList = []

			const db = client.db(dbName)

			const collection = db.collection('fisconet')
			// collection.createIndex( { 'fields.FinFisconetKeywordList': 'text' } ) // improve performances
			// collection.createIndex( { keywords: 1 } ) // improve performances
			let promises = [] 
			for (var j = 0; j < keywords.length ; j++) {
				const keyword = keywords[j].keyword
				
				// Using a text index:
				// const query = { $text: { $search: `"${keyword}"` } }

				// Using multikey index on keywords: 
				const query = { keywords: keyword }
				const foundPromise = collection.find(query).project(projection).toArray()
				promises.push(foundPromise)
			}

			sourceList = await Promise.all(promises)

			sourceList = sourceList.flat()

			sourceList = sourceList.filter((item, pos, self) => {
				return self.indexOf(item) == pos
			})
			
			newSentences[i].sources = sourceList
		}
		
		callback(newSentences)
	})
}


async function findSourcesForKeywords (keywordsPromise, originalKeyword) {
	console.log('findSourcesForKeyword originally: ' + JSON.stringify(originalKeyword))
	let keywords = await keywordsPromise
	keywords = keywords.map((obj) => {
		return obj.metadata.original
	})
	let promises = []

	keywords.forEach((keyword) => {
		promises.push(findSourcesForKeyword(keyword))
	})
	console.log(originalKeyword+ '=> Keyword promise resolved: ' + JSON.stringify(keywords))
	
	return Promise.all(promises)
}

async function findSourcesForKeyword(keyword, originalKeyword) {
	const projection = {'fields.Title': 1, 'fields.FinFisconetDispSummary':1, 'fields.FinFisconetDocumentType_FR':1, 'fields.FinFisconetDocumentDate':1, originalKeyword:1 }
	try {
		const client = await MongoClient.connect(mongoURI)

		const db = client.db(dbName)

		const collection = db.collection('fisconet')

		// Using multikey index on keywords: 
		const query = { keywords: keyword }
		// return collection.find(query).project(projection).map((doc)=>{
		// 	// doc.originalKeyword=originalKeyword
		// 	return {...doc, originalKeyword}
		// }).toArray()
		return collection.find(query).project(projection).toArray()
	} catch (error) {
			console.log('MongoClient Connection error in findSourcesForKeyword')
			console.log(error)
			return []
	}
}


function getSource (id, callback) {
	MongoClient.connect(mongoURI, async (err, client) => {
		if (err) {
			console.log('MongoClient Connection error')
			console.log(err)
			callback({})
		}

		const db = client.db(dbName)
		const collection = db.collection('fisconet')

		collection.findOne({_id: {"$regex": `.* - ${id}`}}, (err, source) => {
			if (err) {
				console.log(err)
			}
			callback(source)
		})
	})
}



module.exports = {
	findSources,
	findSourcesForKeywords,
	getSource
}