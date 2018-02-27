import React, { Component } from 'react';


import 'xterm/dist/xterm.css';

// sadly the other way is broken
const Xterm = require('xterm/dist/xterm.js');
const terminado = require('xterm/dist/addons/terminado/terminado');
Xterm.applyAddon(terminado);


class Terminal extends Component {
    constructor(props) {
        super(props);
        this.host = this.props.host;

        this.terminal = <div
            id={'terminal-container' + this.key}
            style={{display: 'inline-block'}}
        />;
    }

    componentDidMount() {
        let term = new Xterm();

        let socketURL = 'ws://' + this.host + '/websocket/' + this.props.socketURL;

        let socket = new WebSocket(socketURL);
        term.terminadoAttach(socket);

        // is there a way to pass a ract element?
        term.open(document.getElementById('terminal-container' + this.key));
    }

    render() {
        return (this.terminal);
    }
}


export default Terminal;
