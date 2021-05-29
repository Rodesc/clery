const jwt = require('jsonwebtoken')

/**
 * Decode the payload of a token
 */
function decodeToken(token) {
	return jwt.verify(token, process.env.JWT_KEY)
}

/**
 * Check if request has bearer token and if it is valid
 */
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
