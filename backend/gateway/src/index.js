const express = require('express')
const app = express()
const tku = require('./utils/middleware')

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

const port = process.env.PORT || 80

// authentication
app.get('/auth', tku.isAuthAttachPayload, (req, res) => {
	console.log('/auth ' + req.payload.user_id)
	res.status(200).send({
		payload: req.payload,
		message: 'Valid token, you are authenticated',
	})
})

// users API gateway
app.get('/user/:email/:password', (req, res) => {
	res.redirect(
		307,
		`http://${req.hostname}:3001/user/${req.params.email}/${req.params.password}`
	)
})

app.get('/user', tku.isAuthAttachPayload, (req, res) => {
	console.log(`get /user by token`)
	res.redirect(307, `http://${req.hostname}:3001/user`)
})

app.post('/companyowner', (req, res) => {
	console.log(`post /companyowner`)
	res.redirect(307, `http://${req.hostname}:3001/companyowner`)
})

// documents API gateway
app.post('/file', tku.isAuthAttachPayload, (req, res) => {
	console.log('Saving file for ' + req.payload.user_id)
	res.redirect(307, `http://${req.hostname}:3003/file/${req.payload.user_id}`)
})

app.get('/files', tku.isAuthAttachPayload, (req, res) => {
	console.log('get /docs uid: ' + req.payload.user_id)
	res.redirect(
		307,
		`http://${req.hostname}:3003/files/${req.payload.user_id}`
	)
})

app.get('/file/:id', tku.isAuthAttachPayload, (req, res) => {
	console.log(`get /file/${req.params.id} uid: ${req.payload.user_id}`)
	res.redirect(307, `http://${req.hostname}:3003/file/${req.params.id}`)
})

app.delete('/file/:id', tku.isAuthAttachPayload, (req, res) => {
	console.log(`delete /file/${req.params.id} uid: ${req.payload.user_id}`)
	res.redirect(307, `http://${req.hostname}:3003/file/${req.params.id}`)
})

// analysis API gateway
app.post('/analysis', tku.isAuthAttachPayload, (req, res) => {
	console.log(`post /analysis uid: ${req.payload.user_id}`)
	res.redirect(307, `http://${req.hostname}:3004/analysis`)
})

app.get('/source', tku.isAuthAttachPayload, (req, res) => {
	res.redirect(
		307,
		`http://${req.hostname}:3004/source?id=${encodeURIComponent(
			req.query.id
		)}`
	)
})

// start the Express server
app.listen(port, () => {
	console.log(`Listening for requests (internal port ${port})`)
})
