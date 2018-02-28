import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import Window from './Window';


// TODO: export into a config
const HOST = '192.168.31.156:8765';

ReactDOM.render(<Window host={HOST}/>, document.getElementById('login'));
