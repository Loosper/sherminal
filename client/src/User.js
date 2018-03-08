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
        return (
            <span>
                <a
                    onClick={
                        (event) => this.props.create_terminal(this.state.username)
                    }
                >{this.state.username}</a>
            </span>
        );//this is wrong
    }
}

export default User;