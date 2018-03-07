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
        let url = 'http://' + process.env.REACT_APP_HOST + '/active_users';

        let self = this;

        axios.get(url).then(function (response) {
            // console.log(response);

            let activeUsers = response.data['active_users'];

            if (activeUsers.length === 1) {
                activeUsers.push('No active users.');
            } else {
                let new_state = self.state.users.slice();

                activeUsers.forEach(function(username) {
                    new_state.push(
                        <User
                            username={username}
                            create_terminal={self.props.terminal_factory}
                            key={self.childid++}
                        />
                    );
                });

                self.setState({users: new_state});
            }

        }).catch(function (error) {
            console.log(error);
        });
    }

    render() {
        return(
            <nav>
                {this.state.users}
            </nav>
        );
    }
}

export default UserBar;
