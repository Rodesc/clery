import { ChangeEvent, MouseEvent, useEffect, useState } from 'react'
import { Button } from '../components/Button'
import AuthService from '../services/AuthService'
import './Account.css'

const Account = ({ createFlashMessage }: any) => {
	const [modifying, setModifying] = useState(false)
	const [user, setUser] = useState({
		first_name: '',
		last_name: '',
		email: '',
		is_owner: 0,
		company_name: '',
	})

	useEffect(() => {
		AuthService.getUser()
			.then((user) => {
				setUser(user.user)
			})
			.catch((err) => {
				createFlashMessage('Erreur lors du chargement des informations')
				console.log(err)
			})
	}, [])

	return (
		<div id="accountPageContent">
			<div className="leftPanel">
				{modifying ? (
					<ModificationPanel
						setModifying={setModifying}
						createFlashMessage={createFlashMessage}
						user={user}
						setUser={setUser}
					/>
				) : (
					<InfoPanel setModifying={setModifying} user={user} />
				)}
			</div>
			<div className="rightPanel">
				Ce panneau droit contiendra des explications et informations sur
				Clery
			</div>
		</div>
	)
}

const InfoPanel = ({ setModifying, user }: any) => {
	// {
	// 	first_name: 'Rodolphe',
	// 	last_name: 'de Schaetzen',
	// 	email: 'test@gmail.com',
	// 	is_owner: 1,
	// 	company_name: 'cabinet',
	// }

	return (
		<div id="infoPanel">
			<div className="nameBar">
				<h1>{user.first_name}</h1>
				<h3>{user.last_name}</h3>
				<Button value={'Modifier'} action={() => setModifying(true)} />
			</div>
			<div id="entreprise">
				{user.is_owner ? 'Administrateur de ' : 'Employé de '}
				{user.company_name}
			</div>
			<div id="logInfo">
				Adresse email: {user.email} <br />
				Mot de passe:{' '}
				<Button value={'Changer'} customStyle={{ height: '24px' }} />
			</div>
			{user.is_owner ? (
				<Button
					value={'Ajouter un employé'}
					customStyle={{ width: '200px', height: '50px' }}
				/>
			) : (
				''
			)}
		</div>
	)
}
const ModificationPanel = ({
	setModifying,
	createFlashMessage,
	user,
	setUser,
}: any) => {
	const modifyInfo = () => {
		//call authService and change info
		//return when OK
		console.log(user)
	}

	const handleFirstName = (event: React.FormEvent<HTMLInputElement>) => {
		setUser({ ...user, first_name: event.currentTarget.value })
	}

	const handleLastName = (event: React.FormEvent<HTMLInputElement>) => {
		setUser({ ...user, last_name: event.currentTarget.value })
	}

	const handleEmail = (event: React.FormEvent<HTMLInputElement>) => {
		setUser({ ...user, email: event.currentTarget.value })
	}

	const handleCompany = (event: React.FormEvent<HTMLInputElement>) => {
		setUser({ ...user, company_name: event.currentTarget.value })
	}

	return (
		<div id="modifPanel">
			<div className="nameBar">
				<input
					type="text"
					className="formInput"
					value={user.first_name}
					onChange={handleFirstName}
				/>
				<input
					type="text"
					className="formInput"
					value={user.last_name}
					onChange={handleLastName}
				/>
			</div>
			<div id="entreprise">
				{user.is_owner ? (
					<>
						Entreprise:
						<input
							type="text"
							className="formInput"
							value={user.company_name}
							onChange={handleCompany}
						/>
					</>
				) : (
					<>Employé de {user.company_name}</>
				)}
			</div>
			<div id="logInfo">
				Adresse email:{' '}
				<input
					type="email"
					className="formInput"
					value={user.email}
					onChange={handleEmail}
				/>{' '}
				<br />
				Mot de passe:{' '}
				<Button
					value={'Changer'}
					customStyle={{ height: '24px' }}
					action={() => {
						createFlashMessage(
							'Veuillez terminer vos modifications pour changer de mot de passe.'
						)
					}}
				/>
			</div>

			<Button
				value={'Confirmer'}
				action={modifyInfo}
				customStyle={{ height: '48px' }}
			/>
			<a href="#" onClick={() => setModifying(false)}>
				{' '}
				Annuler{' '}
			</a>
		</div>
	)
}

export default Account
