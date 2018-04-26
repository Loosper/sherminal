import React, { Component } from 'react';

import 'react-contexify/dist/ReactContexify.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';


class User extends Component {
    constructor(props) {
        super(props);

        this.onClick = this.onClick.bind(this);

        this.state = {
            username: this.props.username,
            avatar: this.props.avatar,
            notifications : []
        };
    }

    onClick(event) {
        if (!this.props.isLoggedUser) {
            this.props.create_terminal(this.state.username)
        }       
    }

    render() {
        return (
            <div className="user">
                <img
                    src={this.state.avatar}
                    onClick={this.onClick}
                    className="avatar"
                    alt="avatar">
                </img>
                <p className="text-center username">{this.state.username}</p>
            </div>
        );
    }
}

export default User;
