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

			for (var j = 0; j < keywords.length ; j++) {
				const keyword = keywords[j].keyword
				
				// Using a text index:
				// const query = { $text: { $search: `"${keyword}"` } }

				// Using multikey index on keywords: 
				const query = { keywords: keyword }
				const found = await collection.find(query).project(projection).toArray()
				sourceList.push(...found)
			}

			sourceList = sourceList.filter((item, pos, self) => {
				return self.indexOf(item) == pos
			})
			
			newSentences[i].sources = sourceList
		}
		
		callback(newSentences)
	})
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
	getSource
}