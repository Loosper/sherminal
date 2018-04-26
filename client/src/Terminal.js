import React, { Component } from 'react';

import 'xterm/dist/xterm.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';

const Xterm  = require('xterm/dist/xterm.js');
const fit = require('xterm/dist/addons/fit/fit');
const terminado = require('xterm/dist/addons/terminado/terminado');

Xterm.applyAddon(terminado);
Xterm.applyAddon(fit);

const CloseButton = require('./images/close-button.png');
const Draggable = require('react-draggable');


class Terminal extends Component {
    constructor(props) {
        super(props);
        this.requestWrite = this.requestWrite.bind(this);
    }

    // TODO: dont allow this for my own termianl
    requestWrite(event) {
        // TODO: @DENIS because of drag, this doesnt register lick if no log
        // the whole div is clickable not just the text
        this.props.sendMessage('request_write', this.props.userName);
    }

    componentDidMount() {
        this.xterm = new Xterm();
        this.xterm.open(document.getElementById('terminal-container' + this.props.terminalId));
        this.xterm.setOption('allowTransparency', true);
        // still broken
        // this.xterm.fit();

        let socketURL = encodeURI('ws://' + process.env.REACT_APP_HOST +
            '/websocket/' + this.props.socketURL + '/' + this.props.authToken);
        this.socket = new WebSocket(socketURL);
        this.props.setSocket(this.socket);
        this.socket.addEventListener('close', (e) => this.props.tearDown(this));
        this.xterm.terminadoAttach(this.socket);
    }

    // TODO: decide whether this should close the socket
    componentWillUnmount() {
        // this.socket.close();
        // this might be unnecessary
        this.xterm.destroy();
    }

    // TODO: 
    //  fix z-index
    //  introduce grid system
    //  resizable?
    //  font shadows
    render() {
        return (
            <Draggable>
                <div className="col-lg-4 col-md-6 col-sm-12 terminal-col">
                    <div className="terminal-window">
                        <div className="col nopadding">
                            <div className="row terminal-bar">
                                <img 
                                    className="close-button" 
                                    src={CloseButton} 
                                    onClick={event => this.props.tearDown(this)} 
                                    alt="close-button"
                                />
                                <div onClick={this.requestWrite} className="col terminal-username">
                                    {this.props.userName}
                                </div>
                            </div>
                            <div 
                                id={'terminal-container' + this.props.terminalId}
                                className='terminal-container'
                            />
                        </div>
                    </div>
                </div>
            </Draggable>
        );
    }
}


export default Terminal;
