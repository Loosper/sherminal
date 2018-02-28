import React, { Component } from 'react';

import axios from 'axios';


class UserBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            users: []
        };
    }

    updateActiveUsers() {
        let url = 'http://' + this.props.host + '/active_users';
        
        axios.get(url)
        .then(function (response) {
            console.log(response);

            this.setState({users: response.data['active_users']});

        }.bind(this))
        .catch(function (error) {
            console.log(error);
        });
    }

    render() {
        this.updateActiveUsers();

        return(
            <div className="row">
                <div className="col-md-12">
                {this.state.users}
                </div>
            </div>
        )
    }
}

export default UserBar;