import React, { Component } from 'react';
import NotificationBar from './NotificationBar';
// import ReactDOM from 'react-dom';
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
        this.onResize = this.onResize.bind(this);

        this.state = {
            hasRequested: false,
            fitted: false
        };
    }

    close(e) {
        this.props.tearDown(this.props.userName);
    }

    requestWrite(event) {
        const isAdmin = this.props.getIsAdmin();

        if (!this.props.isLogged && !this.state.hasRequested && !isAdmin) {
            this.setState({hasRequested: true});

            let notification = this.notifications.make_notification(
                'Request access to this terminal?',
                () => this.props.sendMessage('request_write', this.props.userName),
                () => this.setState({hasRequested: false}), () => this.setState({hasRequested: false}),
                'Yes', 'No'
            );

            this.notifications.add_notification(notification);
        }
    }

    onResize(e) {
        this.xterm.fit();
    }

    componentDidMount() {
        //theme: {foreground: 'black', background:'white'} white theme
        this.xterm = new Xterm({cursorBlink: true, allowTransparency: true});
        this.xterm.open(this.container);
        window.addEventListener('resize', this.onResize);

        let socketURL = encodeURI('ws://' + process.env.REACT_APP_HOST +
            '/websocket/' + this.props.socketURL + '/' + this.props.authToken);
        this.socket = new WebSocket(socketURL);
        this.props.setSocket(this.socket);
        this.socket.addEventListener('close', this.close);
        this.xterm.terminadoAttach(this.socket);

        setTimeout(() => {
            if (this.socket.readyState === 1) {
                this.xterm.fit();
            }
        }, 50);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize);
        this.socket.removeEventListener('close', this.close);
        this.socket.close();
        this.xterm.destroy();
    }

    getNotifications() {
        return this.notifications;
    }

    // TODO:
    //  selecting text gets fucked when dragged ONLY CHROME :O
    //  animations
    render() {
        return (
            <div
                key={this.props.key} 
                className={this.props.className + ' terminal-window'} 
                style={this.props.style}
                onMouseDown={this.props.onMouseDown}
                onMouseUp={this.props.onMouseUp}
                onTouchStart={this.props.onTouchStart}
                onTouchEnd={this.props.onTouchEnd}
            >
                <div className="terminal-bar">
                    <img
                        className="close-button"
                        src={CloseButton}
                        onClick={this.close}
                        alt="close-button"
                    />
                    {this.props.userName}
                </div>
                <div
                    className='terminal-container'
                    onClick={this.requestWrite}
                    ref={ref => this.container = ref}
                />
                <NotificationBar
                    registerMessage={this.props.registerMessage}
                    sendMessage={this.props.sendMessage}
                    ref={ref => this.notifications = ref}
                    isLogged={this.props.isLogged}
                />
                {this.props.children}
            </div>
        );
    }
}


export default Terminal;
