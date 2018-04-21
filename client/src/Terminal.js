import React, { Component } from 'react';


import 'xterm/dist/xterm.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import './styles/main.css';

// sadly the other way is broken
const Xterm = require('xterm/dist/xterm.js');
const terminado = require('xterm/dist/addons/terminado/terminado');
const fit = require('xterm/dist/addons/fit/fit');

const CloseButton = require('./images/close-button.png');

Xterm.applyAddon(terminado);
Xterm.applyAddon(fit);


class Terminal extends Component {
    constructor(props) {
        super(props);

        //this.sizeContainer = this.props.size === 2 ? "col-md-6" : "col-md-12";

        this.state = {
            xterm: null,
            socket: null,
            terminal: 
            <div className="col-md-6 terminal-col">
                <div className="terminal-window border-top border-white terminal-color">
                    <div className="row terminal-menu">
                        <div className="col-md text-left terminal-username-offset">
                            {this.props.userName}
                        </div>
                        <div className="col-md text-right"onClick={event => this.props.tearDown(this)}>
                            <img src={CloseButton} className="close-icon">
                            </img>
                        </div>
                    </div>
                    <div id={'terminal-container' + this.props.terminalId} className="border-top border-secondary"/>
                </div>
            </div>
        };
    }

    componentDidMount() {
        let new_xterm = new Xterm();

        let socketURL = encodeURI('ws://' + process.env.REACT_APP_HOST +
            '/websocket/' + this.props.socketURL + '/' + this.props.authToken);

        let new_socket = new WebSocket(socketURL);

        new_socket.addEventListener('close', (e) => this.props.tearDown(this));

        new_xterm.terminadoAttach(new_socket);

        // is there a way to pass a ract element?
        new_xterm.open(document.getElementById('terminal-container' + this.props.terminalId));

        this.setState({
            xterm: new_xterm,
            socket: new_socket
        });
    }

    componentWillUnmount() {
        this.state.socket.close();
        // this might be unnecessary
        this.state.xterm.destroy();
    }

    render() {
        return (this.state.terminal);
    }
}


export default Terminal;
