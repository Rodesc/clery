import './Header.css';
import { Button, LinkButton } from './Button'
import { Link } from 'react-router-dom';

function header(props: headerProps) {
	
	const logOut = (e:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		props.logOutUser(e)
	}

	var loggedIn = false;
	if(props.loggedIn) loggedIn = true;
	return (
	    <header className="header">
			<img className="logo" alt='logo' src='img/Logo.png' />
            <p className="brand" >Clery.ai</p>
			<div className='identification'>
				{loggedIn? 
				<Button value='Déconnexion' action={logOut}/>
				:<>
					<LinkButton value="S'enregistrer" linkTo='/register'/>
					<Link to='/login'>Connexion</Link>
				</>}
			</div>
        </header>
	)
}


type headerProps = {
	loggedIn?: boolean,
	logOutUser: Function
}

export default header