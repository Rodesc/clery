import axios from 'axios'

const url = process.env.GATEWAY_URL || 'http://localhost:3000'

const analyse = async (file?: File) => {
	console.log('Analysing document')
	if (file === undefined) return {}

	const fd = new FormData()
	fd.append('file', file)

	const token = localStorage.getItem('authToken') || ''

	const config = {
		headers: { Authorization: `Bearer ${token.replace(/['"]+/g, '')}` },
	}

	const response = await axios.post(url + '/analysis', fd, config)

	if (response === null) {
		return {}
	}
	console.log(response.data)

	return response.data
}

export default {
	analyse,
}
