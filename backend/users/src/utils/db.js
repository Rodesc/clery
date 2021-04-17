const mariadb = require('mariadb')

const DB_NAME = process.env.DB_NAME

const pool = mariadb.createPool({
	host: process.env.DB_HOST,
	user: 'root',
	password: 'clerypassword',
	database: process.env.DB_NAME,
})

function createCompanyEmployee(user) {
	console.log('createCompanyEmployee')
	
	pool.getConnection()
		.then((conn) => {
			const SQLQuery = `INSERT INTO users(prenom, nom, email, date_inscription, user_type) VALUES ('rod', 'olphe', 'rodolphe.deschaetzen@student.uclouvain.be', CURDATE(), 0);`
			conn.query(SQLQuery)
				.then((res) => {
					console.log('success')
					console.log(res)
					conn.end()
				})
				.catch((err) => {
					//handle error
					console.log(err)
					conn.end()
				})
		})
		.catch((err) => {
			console.log('not connected')
			console.log(err)
		})
}

function createUserCompany(user) {}

function deleteEmployee(user) {}

function deleteUserCompany(user) {}

function getCompanyEmployees(company) {}

function promoteCompanyEmployee()

module.exports = {
	createUser,
}
