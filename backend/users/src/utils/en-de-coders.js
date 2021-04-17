const moment = require('moment')
const jwt = require('jwt-simple')

function encodeToken(user) {
	var payload = {
		exp: moment().add(14, 'days').unix(),
		iat: moment().unix(),
		user: user,
	}
	return jwt.encode(payload, process.env.TOKEN_SECRET)
}

function decodeToken(token) {
	return jwt.decode(token, process.env.TOKEN_SECRET)
}

module.exports = {
	encodeToken,
	decodeToken,
}
