import axios from 'axios'

// parse own url to get gateway endpoint
const parser = document.createElement('a')
parser.href = window.location.href

const url = process.env.GATEWAY_URL || 'http://' + parser.hostname + ':3000'

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

const getSource = async (id: string) => {
	console.log('getSource')

	const token = localStorage.getItem('authToken') || ''

	const config = {
		headers: { Authorization: `Bearer ${token.replace(/['"]+/g, '')}` },
		params: { id: id },
	}

	const response = await axios.get(url + '/source', config)

	if (response === null) {
		return {}
	}
	console.log(response.data)

	return response.data
}

export default {
	analyse,
	getSource,
}
