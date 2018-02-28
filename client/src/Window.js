import React, { Component } from 'react';

import Terminal from './Terminal';
import LoginHandler from './LoginHandler';
import UserBar from './UserBar';


class Window extends Component {
    constructor(props) {
        super(props);
        this.setupClient = this.setupClient.bind(this);

        this.host = this.props.host;
        this.state = {
            loggedIn: false, 
            terminals: [], 
            users: <UserBar host={this.host}/>
        };
        // this is bad but works
        this.termid = 0;
    }

    setupClient(socket_path) {
        let new_state = this.state.terminals.slice();
        new_state.push(<Terminal
            host={this.host}
            socketURL={socket_path}
            key={this.termid++}
        />);

        this.setState({
            loggedIn: true, 
            terminals: new_state
         });
    }

    render() {
        if (!this.state.loggedIn) {
            return (<LoginHandler onSubmit={this.setupClient} host={this.host}/>);
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
