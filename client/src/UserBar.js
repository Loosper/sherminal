import React, { Component } from 'react';
import User from './User';

import axios from 'axios';


class UserBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            users: []
        };
        this.childid = 0;
    }

    componentDidMount() {
        let url = 'http://' + this.props.host + '/active_users';
        // let host = this.props.host;//js scope has cancer
        let new_state = this.state.users.slice();
        let self = this;

        axios.get(url).then(function (response) {
            // console.log(response);

            let activeUsers = response.data['active_users'];

            if (activeUsers.length === 0) {
                activeUsers.push('No active users.');
                return;
            }

            activeUsers.forEach(function(username) {
                // let terminalPath = 'http://' + host + '/websockets/' + username;

                new_state.push(
                    <User
                        username={username}
                        create_terminal={self.props.terminal_factory}
                        key={self.childid++}
                    />
                );
            });

            self.setState({users: new_state});

        }).catch(function (error) {
            console.log(error);
        });
    }

    render() {
        return(
            <nav className="navbar navbar-light bg-light">
                {this.state.users}
            </nav>
        );
    }
}

export default UserBar;
