import Auth from './screens/Auth'
import Upload from './screens/Upload'
import Analysis from './screens/Analysis'
import Account from './screens/Account'

import Header from './components/Header'
import FlashMessages, { flashMessage } from './components/FlashMessages'

import AuthService from './services/AuthService'

import {
	RouteComponentProps,
	BrowserRouter as Router,
	Route,
	Redirect,
	Switch,
	useHistory,
	useLocation,
} from 'react-router-dom'

import { useEffect, useState } from 'react'

const App = () => {
	const [flashMessages, setFlashMessages] = useState<flashMessage[]>([])
	const [loggedIn, setLoggedIn] = useState<boolean>(false)
	const history = useHistory()
	const location = useLocation()

	// check if logged in at each route
	useEffect(() => {
		const token = localStorage.getItem('authToken')
		if (token === null) {
			setLoggedIn(false)
		} else {
			AuthService.isAuth(token)
				.then((isAuth) => {
					setLoggedIn(isAuth)
				})
				.catch((err) => {
					setLoggedIn(false)
				})
		}
	}, [location])

	function createFlashMessage(text: string, type = 'success') {
		const message: flashMessage = { text, type }
		setFlashMessages(flashMessages?.concat(message))
	}

	function deleteFlashMessage(index: number) {
		setFlashMessages(
			flashMessages?.filter((e) => flashMessages.indexOf(e) !== index)
		)
	}

	function logOutUser(e: Event) {
		setLoggedIn(false)
		history.push('/')
		localStorage.removeItem('authToken')
		createFlashMessage('You are now logged out')
	}

	return (
		<div>
			<Router>
				<Header loggedIn={loggedIn} logOutUser={logOutUser} />
				<FlashMessages
					messages={flashMessages}
					deleteFlashMessage={deleteFlashMessage}
				/>
				<Switch>
					<Route path="/register">
						{loggedIn ? (
							<Redirect to="/upload" />
						) : (
							<Auth
								showLogin={false}
								createFlashMessage={createFlashMessage}
								setLoggedIn={setLoggedIn}
							/>
						)}
					</Route>

					<Route path="/login">
						{loggedIn ? (
							<Redirect to="/upload" />
						) : (
							<Auth
								showLogin={true}
								createFlashMessage={createFlashMessage}
								setLoggedIn={setLoggedIn}
							/>
						)}
					</Route>

					<Route path="/upload">
						{!loggedIn ? (
							<Redirect to="/login" />
						) : (
							<Upload createFlashMessage={createFlashMessage} />
						)}
					</Route>

					<Route path="/account">
						{!loggedIn ? (
							<Redirect to="/login" />
						) : (
							<Account createFlashMessage={createFlashMessage} />
						)}
					</Route>

					<Route
						path="/analysis"
						render={({
							location,
						}: RouteComponentProps<{}, {}, any>) => {
							if (!loggedIn) return <Redirect to="/" />

							if (location.state && location.state.file)
								return (
									<Analysis
										file={location.state.file}
										analysis={location.state.analysis}
									/>
								)
							else return <Redirect to="/upload" />
						}}
					/>
				</Switch>
			</Router>
		</div>
	)
}

export default App
