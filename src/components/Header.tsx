import './Header.css';
import { Button, LinkButton } from './Button'
import { Link } from 'react-router-dom';

type headerProps = {
	loggedIn?: boolean
}

function header(props: headerProps) {
	var loggedIn = false;
	if(props.loggedIn) loggedIn = true;
	return (
	    <header className="header">
			<img className="logo" alt='logo' src='img/Logo.png' />
            <p className="brand" >Clery.ai</p>
			<div className='identification'>
				{loggedIn? 
				<Button value='Déconnexion' />
				:<>
					<LinkButton value="S'enregistrer" linkTo='/register'/>
					<Link to='/login'>Connexion</Link>
				</>}
			</div>
        </header>
	)
}

export default header