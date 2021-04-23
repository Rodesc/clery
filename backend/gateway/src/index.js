const express = require('express')
const app = express()
const tku = require('./utils/auth.middleware')

// Add headers
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*')
	res.header(
		'Access-Control-Allow-Methods',
		'GET, PUT, POST, DELETE, OPTIONS'
	)
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	)
	next()
})

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const port = 80

// authentication
app.get('/auth', (req, res) => {
	console.log('auth')

	const authorization = req.header('Authorization')
	if (!authorization) {
		console.log('No bearer token provided')
		return res.status(401).send({
			message: 'No bearer token provided',
		})
	}

	const token = authorization.replace('Bearer ', '')
	console.log('token')

	try {
		const payload = tku.decodeToken(token)
		return res.status(200).send({
			payload: payload,
			message: 'Valid token, you are authenticated',
		})
	} catch (err) {
		return res.status(401).send({
			message: 'Invalid token',
		})
	}
})

// users API gateway
app.get('/user/:email/:password', (req, res) => {
	res.redirect(
		308,
		`http://${req.hostname}:3001/user/${req.params.email}/${req.params.password}`
	)
})

app.get('/user/:token', (req, res) => {
	res.redirect(308, `http://${req.hostname}:3001/user/${req.params.token}`)
})

app.post('/companyowner', (req, res) => {
	res.redirect(308, `http://${req.hostname}:3001/companyowner`)
})

// start the Express server
app.listen(port, () => {
	console.log(`Listening for requests (internal port ${port})`)
})
