import './Auth.css'
import Header from '../components/Header'
import { Button, LinkButton } from '../components/Button'
import React, { ChangeEvent, useState } from 'react'
import { Link, useHistory, withRouter } from 'react-router-dom'
import AuthService from '../services/AuthService'

type authProps = {
	showLogin: boolean
	setLoggedIn: Function
	createFlashMessage: Function
	logInUser?: Function
	registerUser?: Function
}

function Auth(props: any) {
	return (
		<div className="authPageContent">
			<div className="leftPanel">
				{props.showLogin ? (
					<LoginForm createFlashMessage={props.createFlashMessage} />
				) : (
					<RegisterForm
						createFlashMessage={props.createFlashMessage}
					/>
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

	function logInUser(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault
		AuthService.loginUser(email, password)
			.then((data) => {
				console.log('User logged in')
				console.log(data)
				// store token locally
				window.localStorage.setItem(
					'authToken',
					JSON.stringify(data.token)
				)
				props.createFlashMessage('Welcome back ' + data.user.first_name)
				// reload page to jump to right screen
				location.reload()
			})
			.catch((err: ErrorEvent) => {
				props.createFlashMessage(
					"Couldn't login.\nWrong email or password."
				)
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
function RegisterForm(props: any) {
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [company, setCompany] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	function registerUser(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault
		const userData = {
			first_name: firstName,
			last_name: lastName,
			password,
			email,
			company_name: company,
		}
		AuthService.registerCompanyOwner(userData)
			.then((data) => {
				console.log('Account created')
				console.log(data)

				window.localStorage.setItem(
					'authToken',
					JSON.stringify(data.token)
				)

				props.createFlashMessage('Welcome ' + data.user.first_name)

				// reload page to jump to right screen
				location.reload()
			})
			.catch((err: ErrorEvent) => {
				props.createFlashMessage(
					'Couldn\t create account.\nReason: ' + JSON.stringify(err)
				)
				console.log(err)
			})
	}

	function handleFirstNameChange(event: React.FormEvent<HTMLInputElement>) {
		setFirstName(event.currentTarget.value)
	}

	function handleLastNameChange(event: React.FormEvent<HTMLInputElement>) {
		setLastName(event.currentTarget.value)
	}

	function handleCompanyChange(event: React.FormEvent<HTMLInputElement>) {
		setCompany(event.currentTarget.value)
	}

	function handleEmailChange(event: React.FormEvent<HTMLInputElement>) {
		setEmail(event.currentTarget.value)
	}

	function handlePassChange(event: React.FormEvent<HTMLInputElement>) {
		setPassword(event.currentTarget.value)
	}

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
				placeholder="Prénom"
				onChange={handleFirstNameChange}
			/>
			<input
				type="text"
				className="formInput"
				placeholder="Nom"
				onChange={handleLastNameChange}
			/>
			<input
				type="text"
				className="formInput"
				placeholder="Nom de l'entreprise"
				onChange={handleCompanyChange}
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
				action={registerUser}
			/>
		</form>
	)
}

export default withRouter(Auth)
