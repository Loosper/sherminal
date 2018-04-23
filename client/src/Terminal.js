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
        this.requestWrite = this.requestWrite.bind(this);

        //this.sizeContainer = this.props.size === 2 ? "col-md-6" : "col-md-12";

        this.xterm = null;
        this.socket = null;
    }

    // TODO: dont allow this for my own termianl
    requestWrite(event) {
        this.props.sendMessage('request_write', this.props.userName);
    }

    componentDidMount() {
        this.xterm = new Xterm();
        let socketURL = encodeURI('ws://' + process.env.REACT_APP_HOST +
            '/websocket/' + this.props.socketURL + '/' + this.props.authToken);
        this.socket = new WebSocket(socketURL);
        this.props.setSocket(this.socket);
        this.socket.addEventListener('close', (e) => this.props.tearDown(this));
        this.xterm.terminadoAttach(this.socket);

        // is there a way to pass a ract element?
        this.xterm.open(document.getElementById(
            'terminal-container' + this.props.terminalId
        ));
    }

    componentWillUnmount() {
        this.socket.close();
        // this might be unnecessary
        this.xterm.destroy();
    }

    render() {
        return (<div className="col-md-6 terminal-col">
            <div className="terminal-window border-top border-white terminal-color">
                <div className="row terminal-menu text-center">
                    <div className="close-button"onClick={event => this.props.tearDown(this)}>
                        <img alt="close-button" src={CloseButton} className="close-icon">
                        </img>
                    </div>
                    <div onClick={this.requestWrite} className="col terminal-username">
                        {this.props.userName}
                    </div>
                </div>
                <div id={'terminal-container' + this.props.terminalId} className="border-top border-secondary"/>
            </div>
        </div>);
    }
}


export default Terminal;
