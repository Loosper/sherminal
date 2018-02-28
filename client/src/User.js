import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';


class User extends Component { 
    constructor(props) {
        super(props);

        this.state = {
            username: this.props.username,
            terminal: this.props.terminal
        }
    }

    render() {
        return(
            <a class="navbar-brand" href={this.state.terminal}>{this.state.username}</a>
        )
    }
}

export default User;