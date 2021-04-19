const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const pool = require('./db')

const isAuthenticated = async (req, res, next) => {
	try {
		const authorization = req.header('Authorization')
		if (!authorization) {
			return res.status(401).send({
				message: 'Not authorized to do this action',
			})
		}

		const token = authorization.replace('Bearer ', '')
		const data = jwt.verify(token, process.env.JWT_KEY)

		const conn = await pool.getConnection()
		const user = conn.query(
			`SELECT * FROM tokens WHERE user_id = '${data.id}'`
		)

		if (!user) {
			return res.status(401).send({
				message: 'Not authorized to do this action',
			})
		}

		req.userId = data.id
		req.email = data.email

		next()
	} catch (err) {
		return res
			.status(500)
			.json({ message: 'Not authorized to do this action', error: err })
	}
}

const encryptPassword = async (req, res, next) => {
	const plaintextpwd = req.body.password
	req.body.password = bcrypt.hashSync(plaintextpwd, bcrypt.genSaltSync())
	next()
}

module.exports = {
	isAuthenticated,
	encryptPassword,
}
