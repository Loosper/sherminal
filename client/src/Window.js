import React, { Component } from 'react';

import Terminal from './Terminal';
import LoginHandler from './LoginHandler';
import UserBar from './UserBar';


class Window extends Component {
    constructor(props) {
        super(props);
        this.setupClient = this.setupClient.bind(this);
        this.addTerminal = this.addTerminal.bind(this);
        this.removeTerminal = this.removeTerminal.bind(this);

        this.state = {
            loggedIn: false,
            terminals: [],
            users: <UserBar terminal_factory={this.addTerminal}/>
        };
        // token for tracking the user
        this.authToken = '';
        // this is bad but works
        this.termid = 0;
    }

    getTerminal(path) {
        // token={this.authToken}
        return <Terminal
            socketURL={path}
            tearDown={this.removeTerminal}
            key={this.termid++}
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
        new_terminals.push(this.getTerminal(path));

        this.setState({terminals: new_terminals});
    }

    removeTerminal(terminal) {
        let new_state = this.state.terminals.slice();
        let index = new_state.indexOf(terminal);

        new_state.splice(index, 1);
        this.setState({terminals: new_state});
    }

    render() {
        if (!this.state.loggedIn) {
            return (<LoginHandler onSubmit={this.setupClient} />);
        } else {
            return (
                <div>
                    {this.state.users}
                    {this.state.terminals}
                </div>
            );//needs to return userbar too?
        }
    }
}


export default Window;
