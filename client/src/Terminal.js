import React, { Component } from 'react';
import NotificationBar from './NotificationBar';
// import { fadeIn, fadeOut } from 'react-animations';

import 'xterm/dist/xterm.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';

const Xterm  = require('xterm/dist/xterm.js');
const fit = require('xterm/dist/addons/fit/fit');
const terminado = require('xterm/dist/addons/terminado/terminado');

Xterm.applyAddon(terminado);
Xterm.applyAddon(fit);

const CloseButton = require('./images/close-button.png');

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

        this.styles = {
            fadeIn: {
                animationName: 'fadeIn',
                animationDuration: '1s'
            }
        };

        this.props.style.zIndex = this.state.zCounter;
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
        this.xterm.fit();
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
    //  selecting text gets fucked when dragged ONLY CHROME :O
    //  animations
    render() {
        if (!this.state.closed) {
            return (
                <div
                    key={this.props.key} 
                    className={this.props.className + ' terminal-window'} 
                    style={this.props.style}
                    onMouseDown={this.props.onMouseDown}
                    onMouseUp={this.props.onMouseUp}
                    onTouchStart={this.props.onTouchStart}
                    onTouchEnd={this.props.onTouchEnd}
                    onClick={(e) => this.setState({zCounter: this.props.zCounter()})}
                >
                    <div className="terminal-bar">
                        <img
                            className="close-button"
                            src={CloseButton}
                            onClick={event => this.close()}
                            alt="close-button"
                        />
                        {this.props.userName}
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
            );
        } else {
            return null;
        }
    }
}


export default Terminal;
