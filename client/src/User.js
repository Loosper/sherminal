import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';


class User extends Component {
    constructor(props) {
        super(props);

        this.state = {
            username: this.props.username,
            avatar: this.props.avatar
        };
    }

    render() {
        // TODO: make this space with HTML
        console.log(this.state.avatar);
        return (
            <img src={this.state.avatar} 
                onClick={(event) => this.props.create_terminal(this.state.username)}
                className="avatar"
                alt="avatar">
            </img>
        );
    }
}

export default User;
