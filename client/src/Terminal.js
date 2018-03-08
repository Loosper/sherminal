import React, { Component } from 'react';


import 'xterm/dist/xterm.css';

// sadly the other way is broken
const Xterm = require('xterm/dist/xterm.js');
const terminado = require('xterm/dist/addons/terminado/terminado');
Xterm.applyAddon(terminado);


class Terminal extends Component {
    constructor(props) {
        super(props);

        this.xterm = null;
        this.terminal = <span
            id={'terminal-container' + this.key}
            style={{display: 'inline-block'}}
        />;
    }

    componentDidMount() {
        this.xterm = new Xterm();

        let socketURL = 'ws://' + process.env.REACT_APP_HOST +
            '/websocket/' + this.props.socketURL;

        let socket = new WebSocket(socketURL);
        socket.addEventListener('close', (e) => this.props.tearDown(this));

        this.xterm.terminadoAttach(socket);
        // console.log(socket.url);

        // is there a way to pass a ract element?
        this.xterm.open(document.getElementById('terminal-container' + this.key));
    }

    componentWillUnmount() {
        // this might be unnecessary
        this.xterm.destroy();
    }

    render() {
        return (this.terminal);
    }
}


export default Terminal;
