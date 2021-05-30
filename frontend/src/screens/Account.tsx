import { useEffect, useState } from 'react'
import { Button } from '../components/Button'
import Modal from '../components/Modal'
import FileElem from '../components/FileElem'
import AuthService from '../services/AuthService'
import DocService from '../services/DocService'
import './Account.css'
import { Doc } from './Upload'

/**
 * Account page
 */
const Account = ({ createFlashMessage }: any) => {
	const [modifying, setModifying] = useState(false)
	const [docs, setDocs] = useState<Doc[]>([])
	const [user, setUser] = useState<User>({
		id: 0,
		first_name: '',
		last_name: '',
		email: '',
		is_owner: 0,
		company_name: '',
	})
	const [pwdModal, setPwdModal] = useState(false)
	const [newUserModal, setNewUserModal] = useState(false)
	const [modifModal, setModifModal] = useState(false)

	// load the file upload history from the user on page load
	useEffect(() => {
		console.log('getting docs..')
		DocService.getDocs()
			.then((docList) => {
				setDocs(docList)
			})
			.catch((err) => {
				console.log(err)
			})
	}, [])

	// load user information on page load and when modifying
	useEffect(() => {
		AuthService.getUser()
			.then((user) => {
				setUser(user.user)
			})
			.catch((err) => {
				createFlashMessage(
					'✖ Erreur lors du chargement des informations'
				)
				console.log(err)
			})
	}, [modifModal])

	// delete file from the database and thus the history
	async function deleteFile(id: string) {
		const isDel = await DocService.deleteDoc(id)

		if (!isDel) {
			console.log('Problème lors de la suppression du fichier')
			createFlashMessage(
				'Problème lors de la suppression du fichier',
				'success'
			)
			return
		}
		createFlashMessage('Document supprimé', 'success')
		setDocs(docs?.filter((e: Doc) => e._id !== id))
	}

	// display all the files from the user's history
	function displayDocs() {
		const documentElements = docs
			?.slice(0)
			.reverse()
			.map((doc: Doc) => {
				const filetype = doc.metadata.originalname.split('.').pop()
				return (
					<FileElem
						key={doc._id}
						file_id={doc._id}
						type={filetype}
						filename={doc.metadata.originalname}
						fileSize={doc.chunkSize.toString()}
						date={doc.uploadDate}
						deleteFile={deleteFile}
					/>
				)
			})
		return <>{documentElements}</>
	}

	return (
		<div id="accountPageContent">
			<div className="leftPanel">
				<div id="infoPanel">
					<div className="nameBar">
						<h1>{user.first_name}</h1>
						<h3>{user.last_name}</h3>
						<Button
							value={'Modifier'}
							action={() => setModifModal(true)}
							customStyle={{ height: '32px' }}
						/>
					</div>
					<div id="entreprise">
						{user.is_owner ? 'Administrateur de ' : 'Employé de '}
						{user.company_name}
					</div>
					<div id="logInfo">
						Adresse email: {user.email} <br />
						Mot de passe:{' '}
						<Button
							value={'Changer'}
							customStyle={{ height: '32px' }}
							action={() => setPwdModal(true)}
						/>
					</div>
					{user.is_owner ? (
						<Button
							value={'Ajouter un employé'}
							customStyle={{ width: '200px', height: '50px' }}
							action={() => setNewUserModal(true)}
						/>
					) : (
						''
					)}
				</div>
			</div>
			<div className="rightPanel">
				<div className="historyWrapper" style={{ width: '80%' }}>
					<h1>Historique des documents</h1>
					{docs.length != 0 ? (
						displayDocs()
					) : (
						<>Vous n&apos;avez pas encore importé de document</>
					)}
				</div>
			</div>
			<ModifModal
				show={modifModal}
				handleClose={() => setModifModal(false)}
				createFlashMessage={createFlashMessage}
				user={user}
				setUser={setUser}
			/>
			<NewUserModal
				show={newUserModal}
				handleClose={() => setNewUserModal(false)}
				createFlashMessage={createFlashMessage}
			/>
			<PwdModal
				show={pwdModal}
				handleClose={() => setPwdModal(false)}
				createFlashMessage={createFlashMessage}
			/>
		</div>
	)
}

/**
 * Modal to change the user's information
 */
const ModifModal = ({
	show,
	handleClose,
	createFlashMessage,
	user,
	setUser,
}: any) => {
	// Function to submit the form
	const modifyInfo = () => {
		AuthService.updateUserInfo(
			user.first_name,
			user.last_name,
			user.email,
			user.company_name
		)
			.then((data) => {
				createFlashMessage('✔ Changements enregistrés ')
				handleClose()
			})
			.catch((err) => {
				createFlashMessage(
					"✖ Problème lors de l'enregistrement des modifications "
				)
				console.log(err)
				handleClose()
			})

		console.log(user)
	}

	/* ===== handler functions =====  */

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
		<Modal show={show} handleClose={handleClose}>
			<h2>Modifier ses informations</h2>
			<label>Prénom, nom:</label>
			<br />
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
			<br />
			{user.is_owner ? (
				<>
					<label>Entreprise:</label>
					<br />
					<input
						type="text"
						className="formInput"
						value={user.company_name}
						onChange={handleCompany}
					/>
					<br />
				</>
			) : (
				<>Employé de {user.company_name}</>
			)}
			<br />
			<label>Adresse email:</label>
			<br />
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
				customStyle={{ height: '32px' }}
				action={() => {
					createFlashMessage(
						'Veuillez terminer vos modifications pour changer de mot de passe.'
					)
				}}
			/>
			<br />
			<br />
			<Button
				value={'Confirmer'}
				action={modifyInfo}
				customStyle={{ height: '48px' }}
			/>
			<a href="#" onClick={handleClose}>
				&nbsp; Annuler
			</a>
		</Modal>
	)
}

/**
 * Modal to change the user's password
 */
const PwdModal = ({ show, handleClose, createFlashMessage }: any) => {
	const [pwd, setPwd] = useState({
		old_pass: '',
		new_pass: '',
	})
	// Function to submit the form
	const changePassword = () => {
		AuthService.changePass(pwd.old_pass, pwd.new_pass)
			.then(() => {
				createFlashMessage(`✔ Nouveau mot de passe enregistré`)
				handleClose()
			})
			.catch((err) => {
				createFlashMessage(`✖ Impossible de changer de mot de passe`)
				console.log(err)
				handleClose()
			})
	}

	/* ===== handler functions =====  */

	const handleOldPassword = (event: React.FormEvent<HTMLInputElement>) => {
		setPwd({ ...pwd, old_pass: event.currentTarget.value })
	}

	const handleNewPassword = (event: React.FormEvent<HTMLInputElement>) => {
		setPwd({ ...pwd, new_pass: event.currentTarget.value })
	}

	return (
		<Modal show={show} handleClose={handleClose}>
			<label>Ancien mot de passe: </label>
			<br />
			<input
				type="password"
				className="formInput"
				placeholder="*******"
				value={pwd?.old_pass}
				onChange={handleOldPassword}
			/>
			<br />
			<label>Nouveau mot de passe: </label>
			<br />
			<input
				type="password"
				className="formInput"
				placeholder="*******"
				value={pwd.new_pass}
				onChange={handleNewPassword}
			/>
			<br />
			<br />
			<Button
				value="Changer de mot de passe"
				customStyle={{ width: '100%', height: '48px' }}
				action={changePassword}
			/>
		</Modal>
	)
}

/**
 * Modal to create an account for a new employee
 */
const NewUserModal = ({ show, handleClose, createFlashMessage }: any) => {
	const [user, setUser] = useState({
		first_name: '',
		last_name: '',
		email: '',
		password: '',
	})
	// Function to submit the form
	const createEmployee = () => {
		AuthService.newEmployee(
			user.first_name,
			user.last_name,
			user.email,
			user.password
		)
			.then((data) => {
				createFlashMessage(
					`✔ Nouvel employé créé avec email '${user.email}' et mot de passe '${user.password}'`
				)
				handleClose()
			})
			.catch((err) => {
				createFlashMessage(
					`✖ Impossible de créer un employé avec l'email '${user.email}' et mot de passe '${user.password}' `
				)
				console.log(err)
				handleClose()
			})

		console.log(user)
	}

	/* ===== handler functions =====  */

	const handleFirstName = (event: React.FormEvent<HTMLInputElement>) => {
		setUser({ ...user, first_name: event.currentTarget.value })
	}

	const handleLastName = (event: React.FormEvent<HTMLInputElement>) => {
		setUser({ ...user, last_name: event.currentTarget.value })
	}

	const handleEmail = (event: React.FormEvent<HTMLInputElement>) => {
		setUser({ ...user, email: event.currentTarget.value })
	}

	const handlePassword = (event: React.FormEvent<HTMLInputElement>) => {
		setUser({ ...user, password: event.currentTarget.value })
	}

	return (
		<Modal show={show} handleClose={handleClose}>
			<div className="cercle">
				<img src="img/logo.png" />
			</div>
			<label>Prénom, nom: </label>
			<br />
			<input
				type="text"
				className="formInput"
				placeholder="Prénom"
				value={user?.first_name}
				onChange={handleFirstName}
			/>
			<input
				type="text"
				className="formInput"
				placeholder="Nom"
				value={user?.last_name}
				onChange={handleLastName}
			/>
			<br />
			<label>Email: </label>
			<br />
			<input
				type="email"
				className="formInput"
				placeholder="Email"
				value={user?.email}
				onChange={handleEmail}
			/>
			<br />
			<label>Mot de passe: </label>
			<br />
			<input
				type="password"
				className="formInput"
				placeholder="Mot de passe"
				value={user?.password}
				onChange={handlePassword}
			/>
			<br />
			<br />
			<span style={{ textAlign: 'center' }}>
				En créant un compte vous acceptez les{' '}
				<a href="/#">Conditions Générales d&apos;Utilisation</a>et notre{' '}
				<a href="/#">politique de confidentialité</a>
			</span>
			<br />
			<br />
			<Button
				value="Créer un compte"
				customStyle={{ width: '100%', height: '48px' }}
				action={createEmployee}
			/>
		</Modal>
	)
}

type User = {
	id: number
	first_name: string
	last_name: string
	email: string
	is_owner: number
	company_name: string
}

export default Account
