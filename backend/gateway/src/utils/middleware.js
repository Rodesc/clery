const jwt = require('jsonwebtoken')

// 	var payload = {
// 		exp: moment().add(14, 'days').unix(),
// 		iat: moment().unix(),
// 		user_id: user_id,
// 		email: email,
// 		is_owner: is_owner,
// 	}

function decodeToken(token) {
	return jwt.verify(token, process.env.JWT_KEY)
}

const isAuthAttachPayload = async (req, res, next) => {
	const authorization = req.header('Authorization')
	if (!authorization) {
		return res.status(401).send({
			message: 'No bearer token provided',
		})
	}

	const token = authorization.replace('Bearer ', '')

	try {
		const payload = decodeToken(token)

		req.payload = payload

		next()
	} catch (err) {
		return res.status(401).send({
			message: 'Invalid token',
		})
	}
}

module.exports = {
	isAuthAttachPayload,
	decodeToken,
}
