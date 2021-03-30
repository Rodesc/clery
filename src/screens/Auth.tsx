import './Auth.css'
import Header from '../components/Header'
import {Button, LinkButton} from '../components/Button'
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

type authProps = {
	showLogin:boolean
}

function Auth(props:authProps) {
	const [login, setLogin] = useState(props.showLogin)
	return (
		<div className='authPageContent'>
			<LeftPanel showLogin={login}/>
			<RightPanel />
		</div>
	)
}

function LeftPanel({showLogin}:any) {
	return (
		<div className='leftPanel'>
			{showLogin? 
			<LoginForm />
			:<RegisterForm />
			}
		</div>
	)
}

function RightPanel() {
	return (
		<div className='rightPanel'>
			Ce panneau droit contiendra des explications et informations sur Clery
		</div>
	)
}

function LoginForm() {
	return (
		<form className='loginForm'>
			<div className='cercle'><img src='img/logo.png'/></div>
			<span>Pas encore membre? <Link to='/register'>Créer un compte</Link></span>
			<input type='email' className='formInput' placeholder='Email'/>
			<input type='password' className='formInput' placeholder='Mot de passe'/>
			<Button value="Se connecter" style={{width:'100%', height:'48px', marginTop: '24px'}}/>
		</form>
	)
}
function RegisterForm() {
	return (
		<form className='registerForm'>
			<div className='cercle'><img src='img/logo.png'/></div>
			<span>Déjà membre? <Link to='/login'>Se connecter</Link></span>
			<input type='text' className='formInput' placeholder='Nom'/>
			<input type='email' className='formInput' placeholder='Email'/>
			<input type='password' className='formInput' placeholder='Mot de passe'/>
			<span style={{textAlign:'center'}}>En créant un compte vous acceptez les <a href='/#'>Conditions Générales d'Utilisation</a>et notre <a href='/#'>politique de confidentialité</a></span>
			<Button value="Créer un compte" style={{width:'100%', height:'48px'}}/>
		</form>
	)
}

export default Auth
