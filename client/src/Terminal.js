import React, { Component } from 'react';


import 'xterm/dist/xterm.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// sadly the other way is broken
const Xterm = require('xterm/dist/xterm.js');
const terminado = require('xterm/dist/addons/terminado/terminado');
const fit = require('xterm/dist/addons/fit/fit');

Xterm.applyAddon(terminado);
Xterm.applyAddon(fit);


class Terminal extends Component {
    constructor(props) {
        super(props);

        this.sizeContainer = this.props.size === 2 ? "col-md-6" : "col-md-12";
        this.xterm = null;
        this.socket = null;

        this.terminal = 
        <div className={this.sizeContainer}>
            <div className="row">
                <div className="col-md text-left text-white">
                    {this.props.userName}
                </div>
                <div className="col-md text-right text-white" onClick={this.props.tearDown}>
                    close
                </div>
            </div>
            <div 
                id={'terminal-container' + this.key}>
            </div>
        </div>;
    }

    componentDidMount() {
        this.xterm = new Xterm();

        let socketURL = encodeURI('ws://' + process.env.REACT_APP_HOST +
            '/websocket/' + this.props.socketURL);

        let socket = new WebSocket(socketURL);
        socket.addEventListener('close', (e) => this.props.tearDown(this));

        this.xterm.terminadoAttach(socket);
        this.socket = socket;
        // console.log(socket.url);

        // is there a way to pass a ract element?
        this.xterm.open(document.getElementById('terminal-container' + this.key));

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
