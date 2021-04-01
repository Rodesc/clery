import React from 'react';
import ReactDOM from 'react-dom';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
	RouteComponentProps,
	Redirect
} from "react-router-dom";
import {Location} from 'history'
import './index.css';

import Auth from './screens/Auth';
import Upload from './screens/Upload';
import Analysis from './screens/Analysis';

import Header from './components/Header';
import reportWebVitals from './reportWebVitals';

const loggedIn = false;

ReactDOM.render(
	<Router>
		<Header loggedIn={loggedIn}/>

		<Route path="/register" render={() => {
			return <Auth showLogin={false}/>
		}}/>

		<Route path="/login" render={() => {
			return <Auth showLogin={true}/>
		}}/>

		<Route path="/upload" >
			{loggedIn ? <Upload /> : <Redirect to="/" />}
		</Route>

		<Route path="/analysis" render={({location}:RouteComponentProps<{}, {}, any>) => {
			if(!loggedIn) return <Redirect to="/" />
			
			if(location.state && location.state.file) 
				return <Analysis file={location.state.file}/>
			else return <Upload />

			
		}} />

	</Router>,
	document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log());

