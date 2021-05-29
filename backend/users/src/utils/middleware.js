const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

/**
 * Hash the password using bcryptjs for security
 */
const encryptPassword = async (req, res, next) => {
	const plaintextpwd = req.body.password
	req.body.password = bcrypt.hashSync(plaintextpwd, bcrypt.genSaltSync())
	next()
}

module.exports = {
	encryptPassword,
}
