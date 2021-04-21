import './Auth.css'
import Header from '../components/Header'
import { Button, LinkButton } from '../components/Button'
import React, { ChangeEvent, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import UserService from '../services/UserService'

type authProps = {
	showLogin: boolean
	setLoggedIn: Function
	createFlashMessage: Function
	logInUser?: Function
	registerUser?: Function
}

function Auth(props: authProps) {
	const [login, setLogin] = useState(props.showLogin)

	return (
		<div className="authPageContent">
			<div className="leftPanel">
				{props.showLogin ? (
					<LoginForm createFlashMessage={props.createFlashMessage} />
				) : (
					<RegisterForm />
				)}
			</div>
			<div className="rightPanel">
				Ce panneau droit contiendra des explications et informations sur
				Clery
			</div>
		</div>
	)
}

function LoginForm(props: any) {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const history = useHistory()

	function logInUser(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault
		console.log('logInUser')
		UserService.loginUser(email, password)
			.then((data) => {
				alert('response: ' + data)
				console.log(data)
				// store token locally
				window.localStorage.setItem(
					'authToken',
					JSON.stringify(data.token)
				)
				//flashMessage online
				props.createFlashMessage('Welcome back ' + data.user.first_name)
				history.push('/upload')
			})
			.catch((err: ErrorEvent) => {
				console.log(err)
			})
	}

	function handleEmailChange(event: React.FormEvent<HTMLInputElement>) {
		setEmail(event.currentTarget.value)
	}

	function handlePassChange(event: React.FormEvent<HTMLInputElement>) {
		setPassword(event.currentTarget.value)
	}

	return (
		<form className="loginForm">
			<div className="cercle">
				<img src="img/logo.png" />
			</div>
			<span>
				Pas encore membre? <Link to="/register">Créer un compte</Link>
			</span>
			<input
				type="email"
				className="formInput"
				placeholder="Email"
				onChange={handleEmailChange}
			/>
			<input
				type="password"
				className="formInput"
				placeholder="Mot de passe"
				onChange={handlePassChange}
			/>
			<Button
				value="Se connecter"
				action={logInUser}
				customStyle={{
					width: '100%',
					height: '48px',
					marginTop: '24px',
				}}
			/>
		</form>
	)
}
function RegisterForm({
	handleNameChange,
	handleEmailChange,
	handlePassChange,
}: any) {
	return (
		<form className="registerForm">
			<div className="cercle">
				<img src="img/logo.png" />
			</div>
			<span>
				Déjà membre? <Link to="/login">Se connecter</Link>
			</span>
			<input
				type="text"
				className="formInput"
				placeholder="Nom"
				onChange={handleNameChange}
			/>
			<input
				type="email"
				className="formInput"
				placeholder="Email"
				onChange={handleEmailChange}
			/>
			<input
				type="password"
				className="formInput"
				placeholder="Mot de passe"
				onChange={handlePassChange}
			/>
			<span style={{ textAlign: 'center' }}>
				En créant un compte vous acceptez les{' '}
				<a href="/#">Conditions Générales d&apos;Utilisation</a>et notre{' '}
				<a href="/#">politique de confidentialité</a>
			</span>
			<Button
				value="Créer un compte"
				customStyle={{ width: '100%', height: '48px' }}
			/>
		</form>
	)
}

export default Auth
