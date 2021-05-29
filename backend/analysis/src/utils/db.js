const MongoClient = require('mongodb')

const dbName = process.env.DB_NAME
const mongoURI =
	`mongodb://` +
	`${process.env.DB_USER}:` +
	`${process.env.DB_PASSWORD}@` +
	`${process.env.DB_HOST}:` +
	`${process.env.DB_PORT}/` +
	`${dbName}`

/**
 * Based on keywords that should be in the database, find the sources and return them
 */
async function findSourcesForKeywords (keywordsPromise, originalKeyword) {
	// Wait for promises to resolve
	let keywords = await keywordsPromise
	keywords = keywords.map((obj) => {
		return obj.metadata.original
	})

	let promises = []
	keywords.forEach((keyword) => {
		promises.push(findSourcesForKeyword(keyword, originalKeyword))
	})
	console.log(originalKeyword+ '=> Keyword promise resolved: ' + JSON.stringify(keywords))
	
	return Promise.all(promises)
}

/**
 * Based on keyword that should be in the database, find the sources and return them
 */
async function findSourcesForKeyword(keyword, originalKeyword) {
	const projection = {'fields.Title': 1, 'fields.FinFisconetDispSummary':1, 'fields.FinFisconetDocumentType_FR':1, 'fields.FinFisconetDocumentDate':1, originalKeyword:1 }
	try {
		const client = await MongoClient.connect(mongoURI)

		const db = client.db(dbName)

		const collection = db.collection('fisconet')

		// Using multikey index on keywords: 
		const query = { keywords: keyword }
		//TODO
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

/**
 * Find the source id in the database and return it in callback
 */
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
	findSourcesForKeywords,
	getSource
}