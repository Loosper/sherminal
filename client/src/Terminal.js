import React, { Component } from 'react';
import Xterm  from 'react-xterm';

import 'xterm/dist/xterm.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import './styles/main.css';

const Draggable = require('react-draggable');
const CloseButton = require('./images/close-button.png');

class Terminal extends Component {
    constructor(props) {
        super(props);
        this.requestWrite = this.requestWrite.bind(this);

        //this.sizeContainer = this.props.size === 2 ? "col-md-6" : "col-md-12";
    }

    bindXterm(xterm) {
        if (xterm !== null) {
            this.xtermRef = xterm.getTerminal();
        }
      }

    // TODO: dont allow this for my own termianl
    requestWrite(event) {
        this.props.sendMessage('request_write', this.props.userName);
    }

    componentDidMount() {
        this.xtermRef.fit();

        let socketURL = encodeURI('ws://' + process.env.REACT_APP_HOST +
            '/websocket/' + this.props.socketURL + '/' + this.props.authToken);
        this.socket = new WebSocket(socketURL);
        this.props.setSocket(this.socket);
        this.socket.addEventListener('close', (e) => this.props.tearDown(this));
        this.xtermRef.terminadoAttach(this.socket);
    }

    // TODO: decide whether this should close the socket
    componentWillUnmount() {
        // this.socket.close();
        // this might be unnecessary
        this.xtermRef.destroy();
    }

    render() {
        // TODO: fix z-index
        return (
            <Draggable>
                <div className="col-md-6 terminal-col">
                    <div className="terminal-window border-top border-white">
                        <div className="row terminal-menu text-center border-bottom border-secondary">
                            <div className="close-button" onClick={event => this.props.tearDown(this)}>
                                <img alt="close-button" src={CloseButton} className="close-icon">
                                </img>
                            </div>
                            <div onClick={this.requestWrite} className="col terminal-username">
                                {this.props.userName}
                            </div>
                        </div>
                        <Xterm 
                            addons={['fit', 'fullscreen', 'terminado']}
                            ref={xterm => this.bindXterm(xterm)}
                        />
                    </div>
                </div>
            </Draggable>
        );
    }
}


export default Terminal;
