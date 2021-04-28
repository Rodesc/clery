const mariadb = require('mariadb')
const bcrypt = require('bcryptjs')
const tku = require('./en-de-coders')

const DB_NAME = process.env.DB_NAME

const pool = mariadb.createPool({
	host: process.env.DB_HOST,
	user: 'root',
	password: 'clerypassword',
	database: process.env.DB_NAME,
})

function createCompanyEmployee(user) {
	console.log('createCompanyEmployee')

	pool.getConnection()
		.then((conn) => {
			const SQLQuery = `INSERT INTO users(prenom, nom, email, date_inscription, user_type) VALUES ('rod', 'olphe', 'rodolphe.deschaetzen@student.uclouvain.be', CURDATE(), 0);`
			conn.query(SQLQuery)
				.then((res) => {
					console.log('success')
					console.log(res)
					conn.end()
				})
				.catch((err) => {
					//handle error
					console.log(err)
					conn.end()
				})
		})
		.catch((err) => {
			console.log('not connected')
			console.log(err)
		})
}

const createCompanyOwner = async (req, res, next) => {
	try {
		const {
			first_name,
			last_name,
			password,
			email,
			company_name,
		} = await req.body
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

				res.status(201).send({
					status: 'success',
					token: tku.encodeToken(user_id[0], company_id[0], true),
					user: user,
				})
			})
			.catch((err) => {
				const msg = 'Error while communicating with database'
				return res.status(500).json({ message: msg, error: err })
			})
	} catch (err) {
		return res.status(500).json({ message: 'Internal error', error: err })
	}
}

async function getUserByToken(req, res) {
	// const authorization = req.header('Authorization')
	// if (!authorization) {
	// 	return res.status(401).send({
	// 		message: 'No bearer token provided',
	// 	})
	// }

	// const token = authorization.replace('Bearer ', '')
	const token = req.params.token
	const { user_id, email } = tku.decodeToken(token) // TODO catch error
	pool.getConnection()
		.then(async (conn) => {
			const queryUser = `SELECT * FROM users WHERE id = '${user_id}'`

			const user = await conn.query(queryUser)

			if (!user || (user && user.length == 0)) {
				return res.status(403).json({ message: "Email doesn't exist" })
			}

			const user_info = extractUserInfo(user[0])

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
			return res.status(500).json({ message: msg, error: err })
		})
}

async function getUser(req, res) {
	const email = req.params.email
	const password = req.params.password
	console.log('getUser')
	pool.getConnection()
		.then(async (conn) => {
			console.log('connected')
			const queryUser = `SELECT * FROM users WHERE email = '${email}'`

			const user = await conn.query(queryUser)
			console.log(user[0])

			if (!user || (user && user.length == 0)) {
				return res.status(403).json({ message: "Email doesn't exist" })
			}

			const isPasswordMatch = await bcrypt.compareSync(
				password,
				user[0].password
			)

			if (!isPasswordMatch) {
				return res
					.status(403)
					.json({ message: 'Your password is not correct' })
			}

			const user_info = extractUserInfo(user[0])

			console.log(user_info)

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
			return res.status(500).json({ message: msg, error: err })
		})
}

function deleteEmployee(user) {}

function deleteUserCompany(user) {}

function getCompanyEmployees(company) {}

function promoteCompanyEmployee() {}

function extractUserInfo(user) {
	const user_info = (({ id, first_name, last_name, email, is_owner }) => ({
		id,
		first_name,
		last_name,
		email,
		is_owner,
	}))(user)
	return user_info
}

module.exports = {
	// loginUser,
	// logoutUser,
	createCompanyOwner,
	getUser,
	getUserByToken,
	pool,
}
