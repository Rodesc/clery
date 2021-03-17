import './Header.css';
import Button from './Button'

type headerProps = {
	loggedIn: boolean
}

function header(props: headerProps) {
	return (
	    <header className="header">
			<img className="logo" alt='logo' src='img/Logo.png' />
            <p className="brand" >Clery.ai</p>
			<div className='identification'>
				{props.loggedIn? 
				<Button value='Déconnexion' />
				:<>
					<Button value="S'enregistrer" />
					<a href='/#'>Connexion</a>
				</>}
			</div>
        </header>
	)
}

export default header