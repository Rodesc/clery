const express = require('express')
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

const port = 80

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

// start the Express server
app.listen(port, () => {
	console.log(`Listening for requests (internal port ${port})`)
})
