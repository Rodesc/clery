const mariadb = require('mariadb')
const bcrypt = require('bcryptjs')
const tku = require('./en-de-coders')

const pool = mariadb.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	idleTimeout: 1000,
	connectionLimit: 50,
})

/**
 * Create a company employee. This can only be done as company owner
 */
const createEmployee = async (req, res, next) => {
	const { first_name, last_name, email, password } = req.body

	const payload = tku.decodeToken(getToken(req))
	const company_id = payload.company_id
	const is_owner = payload.is_owner

	if (!is_owner) {
		return res.status(403).json({
			message: 'You are not the owner of a company',
		})
	}

	pool.getConnection()
		.then(async (conn) => {
			console.log('connected')
			// hash password
			// insert into users
			const hashed_pass = await bcrypt.hashSync(
				password,
				bcrypt.genSaltSync()
			)

			const user_query = `INSERT INTO users VALUES (0,
										'${first_name}', 
										'${last_name}', 
										'${email}', 
										'${hashed_pass}', 
										'${company_id}', 
										FALSE, 
										CURDATE());`

			const new_user = await conn.query(user_query)

			const user_id = new_user.insertId

			const user = {
				id: user_id,
				first_name,
				last_name,
				email,
				is_owner: 0,
			}

			console.log('Employee created')
			conn.release()
			res.status(201).send({
				status: 'success',
				token: tku.encodeToken(user_id, company_id, false),
				user: user,
			})
		})
		.catch((err) => {
			const msg =
				'Error while communicating with database, email might be used already.'
			console.log(err)
			res.status(500).json({ message: msg, error: err })
		})
}

/**
 * Helper function
 * Get the token from the Authorization header of req (request)
 */
const getToken = (req) => {
	const authorization = req.header('Authorization')
	if (!authorization) {
		return res.status(401).send({
			message: 'No bearer token provided',
		})
	}
	return authorization.replace('Bearer ', '')
}

/**
 * Update the password of user
 */
const updatePassword = async (req, res, next) => {
	const { old_pass, new_pass } = req.body

	const payload = tku.decodeToken(getToken(req))
	const user_id = payload.user_id

	pool.getConnection()
		.then(async (conn) => {
			// Get old password from user
			const queryUser = `SELECT * FROM users WHERE id = ${user_id}`

			const user = await conn.query(queryUser)

			if (!user || (user && user.length == 0)) {
				return res.status(403).json({ message: "User doesn't exist" })
			}

			// Check if old password is correct
			const isPasswordMatch = await bcrypt.compareSync(
				old_pass,
				user[0].password
			)

			if (!isPasswordMatch) {
				return res
					.status(403)
					.json({ message: 'Old password is not correct' })
			}

			// Update table with new password
			const hashed_pass = await bcrypt.hashSync(
				new_pass,
				bcrypt.genSaltSync()
			)
			await conn.query(
				`UPDATE users SET password='${hashed_pass}' WHERE id=${user_id};`
			)

			// done
			conn.release()
			console.log('User password updated')

			res.status(201).send({
				status: 'success',
			})
		})
		.catch((err) => {
			const msg = 'Error while communicating with database.'
			console.log(err)
			return res.status(500).json({ message: msg, error: err })
		})
}

/**
 * Update the first_name, last_name, email & company_name of a user
 */
const updateUser = async (req, res, next) => {
	const { first_name, last_name, email, company_name } = req.body

	const payload = tku.decodeToken(getToken(req))
	const company_id = payload.company_id
	const user_id = payload.user_id
	const is_owner = payload.is_owner

	pool.getConnection()
		.then(async (conn) => {
			// Update user
			await conn.query(
				`UPDATE users SET first_name='${first_name}', last_name='${last_name}', email='${email}' WHERE id=${user_id};`
			)

			if (is_owner) {
				// Update company name only if owner
				await conn.query(
					`UPDATE companies SET company_name='${company_name}' WHERE id=${company_id};`
				)
			}

			conn.release()
			console.log('User updated')

			res.status(201).send({
				status: 'success',
			})
		})
		.catch((err) => {
			const msg =
				'Error while communicating with database, email might be used already.'

			console.log(err)
			res.status(400).json({ message: msg, error: err })
		})
}

/**
 * Create new user that is owner
 * Create company as well
 */
const createOwner = async (req, res, next) => {
	try {
		const { first_name, last_name, password, email, company_name } =
			await req.body
		pool.getConnection()
			.then(async (conn) => {
				const company_query = `INSERT INTO companies VALUES (0,'${company_name}');`

				const new_company = await conn.query(company_query)

				const company_id = new_company.insertId

				const user_query = `INSERT INTO users VALUES (0,
										'${first_name}', 
										'${last_name}', 
										'${email}', 
										'${password}', 
										'${company_id}', 
										TRUE, 
										CURDATE());`
				const new_user = await conn.query(user_query)

				const user_id = new_user.insertId

				const user = {
					id: user_id,
					first_name,
					last_name,
					email,
					is_owner: 1,
				}
				console.log('New company and owner created')
				conn.release()
				res.status(201).send({
					status: 'success',
					token: tku.encodeToken(user_id, company_id, true),
					user: user,
				})
			})
			.catch((err) => {
				const msg = 'Error while communicating with database'

				console.log('Error while communicating with database')
				return res.status(500).json({ message: msg, error: err })
			})
	} catch (err) {
		return res.status(500).json({ message: 'Internal error', error: err })
	}
}

/**
 * Return user information based
 */
async function getUserByToken(req, res) {
	console.log('Getting user with token')
	const authorization = req.header('Authorization')
	if (!authorization) {
		return res.status(401).send({
			message: 'No bearer token provided',
		})
	}

	const token = authorization.replace('Bearer ', '')
	const { user_id, email } = tku.decodeToken(token) // TODO catch error
	pool.getConnection()
		.then(async (conn) => {
			// getting user information
			const queryUser = `SELECT * FROM users WHERE id = '${user_id}'`
			const user = await conn.query(queryUser)
			if (!user || (user && user.length == 0)) {
				return res
					.status(403)
					.json({ message: `User with id ${user_id} doesn't exist` })
			}

			// getting company information
			const queryComp = `SELECT * FROM companies WHERE id = '${user[0].company_id}'`
			const company = await conn.query(queryComp)
			if (!company || (company && company.length == 0)) {
				return res.status(403).json({
					message: `Company with id ${user[0].company_id} doesn't exist`,
				})
			}

			const company_name = company[0].company_name
			const user_info = extractUserInfo({ ...user[0], company_name })

			console.log('Success')
			conn.release()
			res.status(201).send({
				status: 'success',
				token: tku.encodeToken(
					user[0].id,
					user[0].company_id,
					user[0].is_owner
				),
				user: user_info,
			})
		})
		.catch((err) => {
			const msg = 'Error while communicating with database'
			console.log(err)
			return res.status(500).json({ message: msg, error: err })
		})
}

/**
 * Login user by email and password
 * Return user information
 */
async function getUser(req, res) {
	const email = req.params.email
	const password = req.params.password
	console.log('getUser')
	pool.getConnection()
		.then(async (conn) => {
			// Get user with email
			const user = await conn.query(
				`SELECT * FROM users WHERE email = '${email}'`
			)

			// Check if email exists
			if (!user || (user && user.length == 0)) {
				return res.status(403).json({ message: "Email doesn't exist" })
			}

			// Check password match
			const isPasswordMatch = await bcrypt.compareSync(
				password,
				user[0].password
			)
			if (!isPasswordMatch) {
				return res
					.status(403)
					.json({ message: 'Your password is not correct' })
			}

			// Get company name
			const company = await conn.query(
				`SELECT company_name FROM companies WHERE id=${user[0].company_id};`
			)
			const company_name = company[0].company_name

			const user_info = extractUserInfo({ ...user[0], company_name })

			console.log('User logged in:')
			console.log(user_info)

			conn.release()

			res.status(201).send({
				status: 'success',
				token: tku.encodeToken(
					user[0].id,
					user[0].company_id,
					user[0].is_owner
				),
				user: user_info,
			})
		})
		.catch((err) => {
			const msg = 'Error while communicating with database'
			console.log(err)
			return res.status(500).json({ message: msg, error: err })
		})
}

/**
 * Helper function to reshape the user information
 */
function extractUserInfo(user) {
	const user_info = (({
		id,
		first_name,
		last_name,
		email,
		is_owner,
		company_name,
	}) => ({
		id,
		first_name,
		last_name,
		email,
		is_owner,
		company_name,
	}))(user)
	return user_info
}

module.exports = {
	createOwner,
	createEmployee,
	getUser,
	getUserByToken,
	updateUser,
	updatePassword,
}
