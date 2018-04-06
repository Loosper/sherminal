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

        this.signOut = this.signOut.bind(this);

        this.state = {
            loggedIn: false,
            terminals: [],
            users: <UserBar terminal_factory={this.addTerminal}/>,
            settings: <SettingsMenu signOut={this.signOut}/>
        };
        // token for tracking the user
        this.authToken = '';
        // this is bad but works
        this.termid = 0;
    }

    signOut(e) {
        e.preventDefault();

        this.setState({
            loggedIn: false,
            terminals: [],
            users: <UserBar terminal_factory={this.addTerminal}/>
        });
    }

    getTerminal(path, size) {
        // token={this.authToken}
        return <Terminal
            userName={path}
            size={size}
            socketURL={path}
            tearDown={this.removeTerminal}
            terminalId={this.termid++}
        />;
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
        new_terminals.push(this.getTerminal(path, new_terminals.size));

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
            document.body.style.backgroundColor = "black";

            return (
                <div className="container-fluid">
                    <div className="row border-bottom border-white">
                        {this.state.users}
                        {this.state.settings}
                    </div>
                    <div className="row">
                        {this.state.terminals}
                    </div>  
                </div>
            );
        }
    }
}


export default Window;
