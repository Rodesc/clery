import './Header.css'
import { Button, LinkButton } from './Button'
import { Link } from 'react-router-dom'

function header(props: headerProps) {
	const logOut = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		props.logOutUser(e)
	}

	let loggedIn = false
	if (props.loggedIn) loggedIn = true
	return (
		<header>
			<img id="logo" alt="logo" src="img/Logo.png" />
			<p id="brand">
				<Link to="/">Clery.ai</Link>
			</p>
			<div id="identification">
				{loggedIn ? (
					<Button value="Déconnexion" action={logOut} />
				) : (
					<>
						<LinkButton value="S'enregistrer" linkTo="/register" />
						<Link to="/login">Connexion</Link>
					</>
				)}
			</div>
		</header>
	)
}

type headerProps = {
	loggedIn?: boolean
	logOutUser: Function
}

export default header
