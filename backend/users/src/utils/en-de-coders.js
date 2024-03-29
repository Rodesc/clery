const moment = require('moment')
const jwt = require('jsonwebtoken')
/**
 * Create a new JSON Web Token
 */
function encodeToken(user_id, company_id, is_owner) {
	var payload = {
		exp: moment().add(14, 'days').unix(),
		iat: moment().unix(),
		user_id: user_id,
		company_id: company_id,
		is_owner: is_owner,
	}

	return jwt.sign(payload, process.env.JWT_KEY)
}

/**
 * Decode the payload of a token
 */
function decodeToken(token) {
	return jwt.verify(token, process.env.JWT_KEY)
}

module.exports = {
	encodeToken,
	decodeToken,
}
