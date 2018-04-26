import React, { Component } from 'react';
import NotificationBar from './NotificationBar';

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

        this.state = {
            notifications: 
                this.props.isLogged ?
                    <NotificationBar
                        registerMessage={this.props.registerMessage}
                        sendMessage={this.props.sendMessage}
                    /> 
                : 
                    null,
            hasRequested: false
        };
    }

    requestWrite(event) {
        if (!this.props.isLogged && !this.state.hasRequested) {
            this.setState({hasRequested: true});
            this.props.sendMessage('request_write', this.props.userName);
        }
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
        // REVIEW: IMO doesn't make any difference; TODO: test if it's done
        // in some extension
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
                                <div className="col terminal-username">
                                    {this.props.userName}
                                </div>
                            </div>
                            <div
                                id={'terminal-container' + this.props.terminalId}
                                className='terminal-container'
                                onClick={this.requestWrite}
                            />
                            {this.state.notifications}
                        </div>
                    </div>
                </div>
            </Draggable>
        );
    }
}


export default Terminal;
