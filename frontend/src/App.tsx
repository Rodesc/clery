// import { Route, Redirect, Switch, useHistory } from 'react-router'
import Auth from './screens/Auth'
import Upload from './screens/Upload'
import Analysis from './screens/Analysis'
import Header from './components/Header'
import FlashMessages, { flashMessage } from './components/FlashMessages'

import {
	RouteComponentProps,
	Route,
	Redirect,
	Switch,
	useHistory,
} from 'react-router-dom'
import { useState } from 'react'

const App = () => {
	const [flashMessages, setFlashMessages] = useState<flashMessage[]>([])
	const [loggedIn, setLoggedIn] = useState<boolean>(true)
	const history = useHistory()

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
		window.localStorage.removeItem('authToken')
		window.localStorage.removeItem('username')
		history.push('/')
		createFlashMessage('You are now logged out')
	}

	function logInUser() {
		// TODO
		setLoggedIn(true)
		createFlashMessage('You are now logged in')
	}

	return (
		<div>
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
						<Auth showLogin={false} />
					)}
				</Route>

				<Route path="/login">
					{loggedIn ? (
						<Redirect to="/upload" />
					) : (
						<Auth showLogin={true} logInUser={logInUser} />
					)}
				</Route>

				<Route path="/upload">
					{!loggedIn ? (
						<Redirect to="/" />
					) : (
						<Upload createFlashMessage={createFlashMessage} />
					)}
				</Route>

				<Route
					path="/analysis"
					render={({
						location,
					}: RouteComponentProps<{}, {}, any>) => {
						if (!loggedIn) return <Redirect to="/" />

						if (location.state && location.state.file)
							return <Analysis file={location.state.file} />
						else return <Redirect to="/upload" />
					}}
				/>
			</Switch>
		</div>
	)
}

export default App
