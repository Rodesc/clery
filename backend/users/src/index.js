const express = require('express')
const db = require('./utils/db')
const { isAuthenticated, encryptPassword } = require('./utils/middleware')

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const port = process.env.port || 80

// define a route handler for the default home page
app.get('/status', (req, res) => {
	console.log({ status: 'ok' })
	res.status(200).send({ status: 'ok' })
})

app.get('/login/:email/:password', db.getUser)

app.get('/login/:token', db.getUserByToken)

app.post('/companyowner', encryptPassword, db.createCompanyOwner)

app.post('/user', (req, res) => {
	console.log(`Creating user`)
	db.loginUser(req, res)
	res.status(200).send({ status: 'ok' })
})

// start the Express server
app.listen(port, () => {
	console.log(`Listening for requests (internal port ${port})`)
})
