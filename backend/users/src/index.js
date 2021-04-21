const express = require('express')
const db = require('./utils/db')
const { encryptPassword } = require('./utils/middleware')

const app = express()

// Add headers
app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, OPTIONS, PUT, PATCH, DELETE'
	)
	res.setHeader(
		'Access-Control-Allow-Headers',
		'X-Requested-With,content-type'
	)
	res.setHeader('Access-Control-Allow-Credentials', true)
	next()
})

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const port = process.env.port || 80

// define a route handler for the default home page
app.get('/status', (req, res) => {
	console.log({ status: 'ok' })
	res.status(200).send({ status: 'ok' })
})

app.get('/user/:email/:password', db.getUser)

app.get('/user/:token', db.getUserByToken)

app.post('/companyowner', encryptPassword, db.createCompanyOwner)

// start the Express server
app.listen(port, () => {
	console.log(`Listening for requests (internal port ${port})`)
})
