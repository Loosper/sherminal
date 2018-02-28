import React, { Component } from 'react';

import axios from 'axios';


class UserBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            users: []
        };
    }

    componentDidMount() {
        let url = 'http://' + this.props.host + '/active_users';

        axios.get(url).then(function (response) {
            console.log(response);

            let activeUsers = response.data['active_users'];

            if (activeUsers.length === 0) {
                activeUsers.push('No active users.');
            }

            this.setState({users: activeUsers});

        }.bind(this)).catch(function (error) {
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
