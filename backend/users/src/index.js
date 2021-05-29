const express = require('express')
const db = require('./utils/db')
const { encryptPassword } = require('./utils/middleware')

const app = express()

// Add headers
app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET,HEAD,OPTIONS,POST,PUT,DELETE'
	)
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Authorization, Access-Control-Request-Headers'
	)
	res.setHeader('Access-Control-Allow-Credentials', true)
	next()
})

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const port = process.env.port || 80

app.get('/status', (req, res) => {
	console.log({ status: 'ok' })
	res.status(200).send({ status: 'ok' })
})

/**
 * Login user with email and password
 */
app.get('/user/:email/:password', db.getUser)

/**
 * Get user information with token
 */
app.get('/user', db.getUserByToken)

/**
 * Create new owner account
 */
app.post('/owner', encryptPassword, db.createOwner)

/**
 * Create new employee account by company owner
 */
app.post('/employee', db.createEmployee)

/**
 * Change password for user with bearer token
 */
app.post('/password', db.updatePassword)

/**
 * Update user with information of req.body
 */
app.post('/user', db.updateUser)

// start the Express server
app.listen(port, () => {
	console.log(`Listening for requests (internal port ${port})`)
})
