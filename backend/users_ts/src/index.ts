import express, { Request, Response } from 'express'
import * as bodyParser from "body-parser";
import db from './utils/crud'

const app = express()

app.use(express.urlencoded()); // parse application/json
app.use(express.json())

const port = 3002

// define a route handler for the default home page
app.get('/status', (req: Request, res: Response) => {
	console.log(`get request`)
	res.status(200).send({})
})

interface NewUser {
  	username:string
	email:string
	password:string
}

app.post('/user', async (req: Request, res: Response) => {
	const newuser = req.body as NewUser
	const username = newuser.username
	const usrPassw = newuser.password


	console.log(`Creating a new user (${JSON.stringify(newuser)})`)
	return db
		.createUser(username, usrPassw)
		.then((token) => {
			console.log(`SUCCESS: user ${username} created successfully`)
			res.status(201).json({ status: 'success', token })
		})
		.catch((err) => {
			console.log(`ERROR: Couldn't create user: ${username}`)
			res.status(409).json({ status: 'error', message: String(err) })
		})
})

// start the Express server
app.listen(port, () => {
	console.log(`server started at http://localhost:${port}`)
})
