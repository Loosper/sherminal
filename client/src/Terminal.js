import React, { Component } from 'react';


import 'xterm/dist/xterm.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import './styles/main.css';

// sadly the other way is broken
const Xterm = require('xterm/dist/xterm.js');
const terminado = require('xterm/dist/addons/terminado/terminado');
const fit = require('xterm/dist/addons/fit/fit');

Xterm.applyAddon(terminado);
Xterm.applyAddon(fit);


class Terminal extends Component {
    constructor(props) {
        super(props);

        //this.sizeContainer = this.props.size === 2 ? "col-md-6" : "col-md-12";
        this.xterm = null;
        this.socket = null;

        this.terminal = <div id={'terminal-container' + this.props.terminalId} className="terminal-round"/>;
    }

    componentDidMount() {
        this.xterm = new Xterm();

        let socketURL = encodeURI('ws://' + process.env.REACT_APP_HOST +
            '/websocket/' + this.props.socketURL + '/' + this.props.authToken);

        let socket = new WebSocket(socketURL);

        socket.addEventListener('close', (e) => this.props.tearDown(this));

        this.xterm.terminadoAttach(socket);
        this.socket = socket;

        // is there a way to pass a ract element?
        this.xterm.open(document.getElementById('terminal-container' + this.props.terminalId));

        // this needs to be figured out
        //this.xterm.fit();
    }

    componentWillUnmount() {
        this.socket.close();
        // this might be unnecessary
        this.xterm.destroy();
    }

    render() {
        return (this.terminal);
    }
}


export default Terminal;
