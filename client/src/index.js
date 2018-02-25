import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import LoginHandler from './LoginHandler';

//ReactDOM.render(<App />, document.getElementById('root'));
ReactDOM.render(<LoginHandler />, document.getElementById('login'));

registerServiceWorker();
