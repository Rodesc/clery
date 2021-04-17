import * as sqlite3 from 'sqlite3'

const db = new sqlite3.Database('users.db');

function createUser(username: string, password: string) {
	return new Promise((resolve, reject) => {
		resolve(username)
		// reject( new Error( `In the creation of user (${usrName}). Reason: ${error.reason}.` ) )
	})
}

export default {
	createUser,
}
