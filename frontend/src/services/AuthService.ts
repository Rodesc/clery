import axios from 'axios'

// parse own url to get gateway endpoint
const parser = document.createElement('a')
parser.href = window.location.href

const url = process.env.GATEWAY_URL || 'http://' + parser.hostname + ':3000'

const isAuth = async (token: string) => {
	const config = {
		headers: { Authorization: `Bearer ${token.replace(/['"]+/g, '')}` },
	}
	const response = await axios.get(url + '/auth', config)
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
		return response.data
	} catch (error) {
		console.error('Error while signing user in')
		console.error(error.response.data)
		throw new Error(error)
	}
}

const registerCompanyOwner = async (data: any) => {
	try {
		console.log('registerCompanyOwner')
		const response = await axios.post(url + '/companyowner', data)
		return response.data
	} catch (error) {
		console.error('Error while creating new user')
		console.error(error.response.data)
		throw new Error(error)
	}
}

const getUser = async () => {
	try {
		const token = localStorage.getItem('authToken') || ''

		const config = {
			headers: { Authorization: `Bearer ${token.replace(/['"]+/g, '')}` },
		}
		const response = await axios.get(url + '/user', config)
		return response.data
	} catch (error) {
		console.error('Error while getting user with token')
		console.error(error)
	}
}

export default {
	isAuth,
	loginUser,
	registerCompanyOwner,
	getUser,
}
