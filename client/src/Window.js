import React, { Component } from 'react';

import Terminal from './Terminal';
import LoginHandler from './LoginHandler';
import UserBar from './UserBar';


import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';

class Window extends Component {
    constructor(props) {
        super(props);
        this.setupClient = this.setupClient.bind(this);
        this.addTerminal = this.addTerminal.bind(this);
        this.removeTerminal = this.removeTerminal.bind(this);
        this.retrieveSocket = this.retrieveSocket.bind(this);
        this.addMessageHandler = this.addMessageHandler.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.getIsAdmin = this.getIsAdmin.bind(this);
        this.signOut = this.signOut.bind(this);

        this.state = {
            loggedIn: false,
            terminals: [],
            layout: [],
            opened: [],
            terminalsRefs: []
        };
        // token for tracking the user
        this.authToken = '';
        // this is bad but works
        this.termid = 0;
        this.messageQueue = {};
        this.webSocket = null;
    }

    signOut(e) {
        this.setState({
            loggedIn: false,
            layout: [],
            terminals: [],
            opened: []
        });

        this.authToken = '';
        this.termid = 0;
        this.messageQueue = {};
        this.webSocket = null;
    }

    getTerminal(path, isLogged) {
        return (
            <Terminal
                key={'terminal' + this.termid}
                userName={path}
                socketURL={path}
                authToken={this.authToken}
                tearDown={this.removeTerminal}
                setSocket={this.retrieveSocket}
                sendMessage={this.sendMessage}
                requestWrite={this.requestWrite}
                terminalId={this.termid}
                isLogged={isLogged}
                registerMessage={this.addMessageHandler}
                getIsAdmin={this.getIsAdmin}
            />
        );
    }

    getIsAdmin() {
        return this.isAdmin;
    }

    sendMessage(type, message) {
        this.webSocket.send(JSON.stringify([type, message]));
    }

    // REVIEW: if you need 2 handler, you need lists of handlers
    addMessageHandler(event_name, handler) {
        this.messageQueue[event_name] = handler;
    }

    retrieveSocket(socket) {
        // use only the firs one for comms
        if (this.webSocket !== null)
            return;

        let self = this;
        socket.addEventListener('message', function (event) {
            let data = JSON.parse(event.data);

            // execute handler for message type
            let handler = self.messageQueue[data[0]];
            if (handler !== undefined)
                handler(data[1]);
        });
        this.webSocket = socket;
        // why hasnt it loaded?
        this.webSocket.addEventListener(
            'open',
            () => this.sendMessage('get_users', '')
        );
    }

    setupClient(socketPath, authToken, isAdmin) {
        this.loggedUser = socketPath;
        this.authToken = authToken;
        this.isAdmin = isAdmin;
        // let newLayout = this.state.layout.slice();
        // newLayout.push({i: 'terminal' + this.termid, x: 0, y: 0, w: 2, h: 3});
        let new_opened = this.state.opened.slice();
        new_opened.push(socketPath);
        let new_state = this.state.terminals.slice();
        new_state.push(this.getTerminal(socketPath, true));

        this.termid++;  

        this.setState({
            opened: new_opened,
            loggedIn: true,
            terminals: new_state
        });
    }

    addTerminal(path, isAdmin) {
        // let newLayout = this.state.layout.slice();
        // newLayout.push({i: 'terminal' + this.termid, x: 0, y: 0, w: 2, h: 1});

        if (!this.state.opened.includes(path)) {
            let new_terminals = this.state.terminals.slice();
            new_terminals.push(this.getTerminal(path, false));
            let new_opened = this.state.opened.slice();
            new_opened.push(path);
            this.termid++;
            this.setState({opened: new_opened, terminals: new_terminals});
        }
    }

    removeTerminal(terminalName) {
        let newOpened = this.state.opened.slice();
        let indexOpened = this.state.opened.indexOf(terminalName);
        this.state.opened.splice(indexOpened, 1);

        this.setState({opened: newOpened});

        if (this.state.opened.length === 0) {
            this.signOut();
        }
    }

    render() {
        if (!this.state.loggedIn) {
            return (<LoginHandler onSubmit={this.setupClient}/>);
        } else {
            return (
                <div className="container-fluid">
                    <div className="content-wraper">
                        <UserBar
                            registerMessage={this.addMessageHandler}
                            terminal_factory={this.addTerminal}
                            thisUser={this.loggedUser}
                            signOut={this.signOut}
                        />
                        <div className="row terminal-row">
                            {this.state.terminals}
                        </div>
                    </div>
                </div>
            );
        }
    }
}


export default Window;
