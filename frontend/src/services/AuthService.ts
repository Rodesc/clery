import axios from 'axios'

const url = process.env.GATEWAY_URL || 'http://localhost:3000'

const isAuth = async (token: string) => {
	const config = {
		headers: { Authorization: `Bearer ${token.replace(/['"]+/g, '')}` },
	}
	console.log(config)
	const response = await axios.get(url + '/auth', config)
	console.log('response')
	if (response === null) {
		return false
	}
	return true
}

const loginUser = async (email: string, password: string) => {
	try {
		console.log('loginUser ... ')
		const response = await axios.get(
			url + '/user/' + email + '/' + password
		)
		console.log(response)
		return response.data
	} catch (error) {
		console.error('error.response.data')
		console.error(error.response.data) // NOTE - use "error.response.data` (not "error")
		return error.response.data
	}
}

const registerCompanyOwner = async (data: any) => {
	try {
		console.log('registerCompanyOwner')
		const response = await axios.post(url + '/companyowner', data)
		console.log(response)
		return response.data
	} catch (error) {
		console.error('error.response.data')
		console.error(error.response.data) // NOTE - use "error.response.data` (not "error")
		return error.response.data
	}
}

export default {
	isAuth,
	loginUser,
	registerCompanyOwner,
}
