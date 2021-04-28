print('Start #################################################################')

db.createUser({
	user: 'root',
	pwd: 'clerypassword',
	roles: [
		{
			role: 'readWrite',
			db: 'documents',
		},
	],
})

print('END #################################################################')
