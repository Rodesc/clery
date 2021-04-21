import axios from 'axios'

const url = process.env.GATEWAY_URL || 'http://localhost:3001'

const loginUser = async (email: string, password: string) => {
	const response = await axios.get(url + '/user/' + email + '/' + password)
	return response.data
}

const registerCompanyOwner = async (data: any) => {
	const response = await axios.post(url + '/companyowner', data)
	return response.data
}

export default {
	loginUser,
	registerCompanyOwner,
}
