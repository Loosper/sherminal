import React, { Component } from 'react';

import Terminal from './Terminal';
import LoginHandler from './LoginHandler';
import UserBar from './UserBar';
import SettingsMenu from './SettingsMenu';

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

        this.signOut = this.signOut.bind(this);

        this.state = {
            loggedIn: false,
            terminals: []
        };
        // token for tracking the user
        this.authToken = '';
        // this is bad but works
        this.termid = 0;
        this.messageQueue = {};
        this.webSocket = null;
    }

    signOut(e) {
        e.preventDefault();

        this.setState({
            loggedIn: false,
            terminals: []
        });
    }

    getTerminal(path, size) {
        this.termid += 1;

        return <Terminal
            key={this.termid}
            userName={path}
            socketURL={path}
            authToken={this.authToken}
            tearDown={this.removeTerminal}
            terminalId={this.termid++}
            setSocket={this.retrieveSocket}
        />;
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
        // if (this.webSocket !== null)
        //     return;

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

    setupClient(socketPath, authToken) {
        this.authToken = authToken;
        let new_state = this.state.terminals.slice();
        new_state.push(this.getTerminal(socketPath));

        this.setState({
            loggedIn: true,
            terminals: new_state
        });
    }

    addTerminal(path) {
        let new_terminals = this.state.terminals.slice();
        new_terminals.push();
        new_terminals.push(this.getTerminal(path));

        this.setState({terminals: new_terminals});
    }

    removeTerminal(terminal) {
        let new_state = this.state.terminals.slice();
        let index = new_state.indexOf(terminal);

        new_state.splice(index, 1);

        let loggedIn = true;
        if (new_state.length === 0) {
            loggedIn = false;
        }

        this.setState({terminals: new_state, loggedIn: loggedIn});
    }

    render() {
        if (!this.state.loggedIn) {
            return (<LoginHandler onSubmit={this.setupClient} />);
        } else {
            return (
                <div className="container-fluid">
                    <div className="row upper-row border-bottom border-white">
                        <UserBar
                            registerMessage={this.addMessageHandler}
                            terminal_factory={this.addTerminal}
                        />
                        <SettingsMenu signOut={this.signOut}/>
                    </div>
                    <div className="row terminal-row">
                        {this.state.terminals}
                    </div>
                </div>
            );
        }
    }
}


export default Window;
