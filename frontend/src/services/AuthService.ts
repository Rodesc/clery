import axios from 'axios'

// parse own url to get gateway endpoint
const parser = document.createElement('a')
parser.href = window.location.href

const url = process.env.GATEWAY_URL || 'http://' + parser.hostname + ':3000'

// Check if the user is authenticated by chehcking if the token is valid
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

// Log user in with email and password
const loginUser = async (email: string, password: string) => {
	try {
		const response = await axios.get(
			url + '/user/' + email + '/' + password
		)
		return response.data
	} catch (error) {
		console.error('Error while signing user in')
		console.error(error.response.data)
		throw error
	}
}

// register new user of type owner and create company
const registerCompanyOwner = async (data: any) => {
	try {
		console.log('registerCompanyOwner')
		const response = await axios.post(url + '/companyowner', data)
		return response.data
	} catch (error) {
		console.error('Error while creating new user')
		console.error(error.response.data)
		throw error
	}
}

// get user info from server by sending token
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
		throw error
	}
}

// update the user's personal information
const updateUserInfo = async (
	first_name: string,
	last_name: string,
	email: string,
	company_name: string
) => {
	try {
		const token = localStorage.getItem('authToken') || ''

		const config = {
			headers: { Authorization: `Bearer ${token.replace(/['"]+/g, '')}` },
		}
		const data = { first_name, last_name, email, company_name }
		const response = await axios.post(url + '/user', data, config)
		return response.data
	} catch (error) {
		console.error('Error while updating user')
		console.error(error)
		throw error
	}
}

// as a owner, create a new user for employee
const newEmployee = async (
	first_name: string,
	last_name: string,
	email: string,
	password: string
) => {
	try {
		const token = localStorage.getItem('authToken') || ''

		const config = {
			headers: { Authorization: `Bearer ${token.replace(/['"]+/g, '')}` },
		}
		const data = { first_name, last_name, email, password }
		const response = await axios.post(url + '/employee', data, config)
		return response.data
	} catch (error) {
		console.error('Error while creating employee')
		console.error(error)
		throw error
	}
}

// update user's password
const changePass = async (old_pass: string, new_pass: string) => {
	try {
		const token = localStorage.getItem('authToken') || ''

		const config = {
			headers: { Authorization: `Bearer ${token.replace(/['"]+/g, '')}` },
		}
		const data = { old_pass, new_pass }
		const response = await axios.post(url + '/password', data, config)
		return response.data
	} catch (error) {
		console.error('Error while changing password')
		console.error(error)
		throw error
	}
}

export default {
	isAuth,
	loginUser,
	registerCompanyOwner,
	getUser,
	updateUserInfo,
	newEmployee,
	changePass,
}
