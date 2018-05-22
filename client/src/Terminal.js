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
        this.close = this.close.bind(this);
        this.onDrag = this.onDrag.bind(this);
        this.onDrop = this.onDrop.bind(this);
        this.onResize = this.onResize.bind(this);
        this.notifications = null;

        this.state = {
            hasRequested: false,
            closed: false,
            zCounter: this.props.zCounter(),
            isTouchingTerminal: false
        };
    }

    getUsername() {
        return this.props.userName;
    }

    close(e) {
        this.props.tearDown(this.props.userName);
        this.setState({closed: true});
    }

    requestWrite(event) {
        if (!this.props.isLogged && !this.state.hasRequested) {
            this.setState({hasRequested: true});

            let isAdmin = this.props.getIsAdmin();
            console.log(isAdmin)
            if (!isAdmin) {
                let notification = this.notifications.make_notification(
                    'Request access to this terminal?',
                    () => this.props.sendMessage('request_write', this.props.userName),
                    () => this.setState({hasRequested: false}),
                    'Yes',
                    'No'
                );

                this.notifications.add_notification(notification);
            }
        }
    }

    onDrag(e) {
        this.setState({isTouchingTerminal: true});
    }

    onDrop(e) {
        this.setState({isTouchingTerminal: false});
    }

    onResize(e) {
        this.xterm.fit();
    }

    componentDidMount() {
        this.xterm = new Xterm();
        this.xterm.open(document.getElementById('terminal-container' + this.props.terminalId));
        this.xterm.setOption('allowTransparency', true);
        // still broken
        window.addEventListener("resize", this.onResize);

        let socketURL = encodeURI('ws://' + process.env.REACT_APP_HOST +
            '/websocket/' + this.props.socketURL + '/' + this.props.authToken);
        this.socket = new WebSocket(socketURL);
        this.props.setSocket(this.socket);
        this.socket.addEventListener('close', (e) => this.props.tearDown(this));
        this.xterm.terminadoAttach(this.socket);
    }

    componentWillUnmount() {
        this.socket.close();
        this.xterm.destroy();
        window.removeEventListener("resize", this.onResize);
    }

    // TODO:
    //  grid system
    //  selecting text gets fucked when dragged
    //  find a way to overflow nicely
    //  animations
    render() {
        if (!this.state.closed) {
            return (
                <Draggable disabled={this.state.isTouchingTerminal}>
                    <div
                        className="col-md-6 col-sm-12 terminal-col"
                        ref={x => this.ref = x}
                        style={{zIndex: this.state.zCounter}}
                        onClick={(e) => this.setState({zCounter: this.props.zCounter()})}
                    >
                        <div className="terminal-window">
                            <div className="col nopadding">
                                <div className="row terminal-bar">
                                    <img
                                        className="close-button"
                                        src={CloseButton}
                                        onClick={event => this.close()}
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
                                    onMouseOver={this.onDrag}
                                    onMouseOut={this.onDrop}
                                />
                                <NotificationBar
                                    registerMessage={this.props.registerMessage}
                                    sendMessage={this.props.sendMessage}
                                    ref={ref => this.notifications = ref}
                                    isLogged={this.props.isLogged}
                                />
                            </div>
                        </div>
                    </div>
                </Draggable>
            );
        } else {
            return null;
        }
    }
}


export default Terminal;
