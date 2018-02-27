import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import Window from './Window';


// TODO: export into a config
const URL = 'http://localhost:8765/';

ReactDOM.render(<Window URL={URL}/>, document.getElementById('login'));
