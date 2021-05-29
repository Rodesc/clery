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

/* ============= gateway service specific functions ============= */

/**
 * Check if user is authenticated, return token payload
 */
app.get('/auth', tku.isAuthAttachPayload, (req, res) => {
	console.log('/auth ' + req.payload.user_id)
	res.status(200).send({
		payload: req.payload,
		message: 'Valid token, you are authenticated',
	})
})

/* ============= users service endpoints ============= */

/**
 * Login user with email and password
 */
app.get('/user/:email/:password', (req, res) => {
	res.redirect(
		307,
		`http://${req.hostname}:3001/user/${req.params.email}/${req.params.password}`
	)
})

/**
 * Get user information with token
 */
app.get('/user', tku.isAuthAttachPayload, (req, res) => {
	console.log(`get /user by token`)
	res.redirect(307, `http://${req.hostname}:3001/user`)
})

/**
 * Create new owner account
 */
app.post('/companyowner', (req, res) => {
	console.log(`post /owner`)
	res.redirect(307, `http://${req.hostname}:3001/owner`)
})

/**
 * Create new employee account by company owner
 */
app.post('/employee', tku.isAuthAttachPayload, (req, res) => {
	console.log(`post /employee`)
	res.redirect(307, `http://${req.hostname}:3001/employee`)
})

/**
 * Update user with information of req.body
 */
app.post('/user', tku.isAuthAttachPayload, (req, res) => {
	console.log(`post /user, updating`)
	res.redirect(307, `http://${req.hostname}:3001/user`)
})

/**
 * Change password for user with bearer token
 */
app.post('/password', tku.isAuthAttachPayload, (req, res) => {
	console.log(`post /password, changing`)
	res.redirect(307, `http://${req.hostname}:3001/password`)
})

/* ============= documents service endpoints ============= */

/**
 * Store file in database
 */
app.post('/file', tku.isAuthAttachPayload, (req, res) => {
	console.log('Saving file for ' + req.payload.user_id)
	res.redirect(307, `http://${req.hostname}:3003/file/${req.payload.user_id}`)
})

/**
 * Get file history
 */
app.get('/files', tku.isAuthAttachPayload, (req, res) => {
	console.log('get /docs uid: ' + req.payload.user_id)
	res.redirect(
		307,
		`http://${req.hostname}:3003/files/${req.payload.user_id}`
	)
})

/**
 * Get file with id from database
 */
app.get('/file/:id', tku.isAuthAttachPayload, (req, res) => {
	console.log(`get /file/${req.params.id} uid: ${req.payload.user_id}`)
	res.redirect(307, `http://${req.hostname}:3003/file/${req.params.id}`)
})

/**
 * Delete file with id
 */
app.delete('/file/:id', tku.isAuthAttachPayload, (req, res) => {
	console.log(`delete /file/${req.params.id} uid: ${req.payload.user_id}`)
	res.redirect(307, `http://${req.hostname}:3003/file/${req.params.id}`)
})

/* ============= analysis service endpoints ============= */

/**
 * Analyse a file
 */
app.post('/analysis', tku.isAuthAttachPayload, (req, res) => {
	console.log(`post /analysis uid: ${req.payload.user_id}`)
	res.redirect(307, `http://${req.hostname}:3004/analysis`)
})

/**
 * Download a source content
 */
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
