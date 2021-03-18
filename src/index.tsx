import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import './index.css';
import Auth from './screens/Auth';
import Header from './components/Header';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <Router>
    <Header/>

    <Route path="/register" render={() => {
      return <Auth showLogin={false}/>
    }}/>

    <Route path="/login" render={() => {
      return <Auth showLogin={true}/>
    }}/>
    
  </Router>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log());
