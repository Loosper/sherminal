import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import Window from './Window';
import UserBar from './UserBar';


// TODO: export into a config
const HOST = 'localhost:8765';

ReactDOM.render(<UserBar host={HOST} />, document.getElementById('userbar'));
ReactDOM.render(<Window host={HOST}/>, document.getElementById('login'));
