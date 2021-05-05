import axios from 'axios'

const url = process.env.GATEWAY_URL || 'http://localhost:3000'

const getDocs = async () => {
	const token = localStorage.getItem('authToken') || ''

	const config = {
		headers: { Authorization: `Bearer ${token.replace(/['"]+/g, '')}` },
	}

	const response = await axios.get(url + '/files', config)
	console.log('response')
	if (response === null) {
		return []
	}
	console.log(response.data)
	return response.data
}

const uploadDoc = async (file?: File) => {
	console.log('Uploading document')
	if (file === undefined) return {}

	const fd = new FormData()
	fd.append('file', file)

	const token = localStorage.getItem('authToken') || ''

	const config = {
		headers: { Authorization: `Bearer ${token.replace(/['"]+/g, '')}` },
	}

	const response = await axios.post(url + '/file', fd, config)
	if (response === null) {
		return {}
	}
	console.log(response.data)

	return response.data
}

const download = async (id: string) => {
	console.log('download ' + id)

	const token = localStorage.getItem('authToken') || ''

	const config = {
		headers: { Authorization: `Bearer ${token.replace(/['"]+/g, '')}` },
	}

	console.log('Awaiting server response')
	const response = await axios.get(url + '/file/' + id, config)
	console.log('Response received yeah')
	if (response === null) {
		return {}
	}
	console.log(response.data.metadata)

	return response.data.imgurl
}

export default {
	getDocs,
	uploadDoc,
	download,
}