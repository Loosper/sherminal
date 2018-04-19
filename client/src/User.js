import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';


class User extends Component {
    constructor(props) {
        super(props);

        this.state = {
            username: this.props.username
        };
    }

    render() {
        // TODO: make this space with HTML
        return (
            <a onClick={(event) => this.props.create_terminal(this.state.username)}>
                {this.state.username + '     '}
            </a>
        );
    }
}

export default User;
