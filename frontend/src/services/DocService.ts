import axios from 'axios'

// parse own url to get gateway endpoint
const parser = document.createElement('a')
parser.href = window.location.href

const url = process.env.GATEWAY_URL || 'http://' + parser.hostname + ':3000'

const getDocs = async () => {
	const token = localStorage.getItem('authToken') || ''

	const config = {
		headers: { Authorization: `Bearer ${token.replace(/['"]+/g, '')}` },
	}

	const response = await axios.get(url + '/files', config)

	if (response === null) {
		return []
	}
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

const deleteDoc = async (id: string) => {
	console.log('Deleting document')
	const token = localStorage.getItem('authToken') || ''

	const config = {
		headers: { Authorization: `Bearer ${token.replace(/['"]+/g, '')}` },
	}

	const response = await axios
		.delete(url + '/file/' + id, config)
		.catch((err) => {
			console.log('Error')
			console.log(err)
			return false
		})
	if (response === null) {
		console.log('response is null')

		return false
	}
	console.log(response)

	return true
}

export default {
	getDocs,
	uploadDoc,
	download,
	deleteDoc,
}
