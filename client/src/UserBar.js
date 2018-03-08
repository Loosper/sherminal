import React, { Component } from 'react';
import User from './User';

// import axios from 'axios';


class UserBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            users: []
        };
        this.events = null;
        this.childid = 0;
    }

    makeUser(username) {
        return <User
            username={username}
            create_terminal={this.props.terminal_factory}
            key={this.childid++}
        />;
    }

    componentDidMount() {
        let url = 'http://' + process.env.REACT_APP_HOST + '/active_users';

        let self = this;

        let events = new EventSource(url); // ,{withCredentials: true});
        this.events = events;
        // events.withCredentials // perhaps cookies?

        events.onerror = function(error) {
            // if this is not done, it will retry the connection
            error.target.close();
        };

        events.onopen = function(event) {
            console.log(event);
        };

        // i hope this is fired only on unnamed events
        events.onmessage = function(event) {
            console.log('1' + event.data);
            let users = JSON.parse(event.data);
            let user_state = [];

            for (let user in users) {
                user_state.push(self.makeUser(user));
            }

            self.setState({users: user_state});
        };

        events.addEventListener('added', function(event) {
            console.log('2' + event.data);
            let new_state = self.state.users.slice();

            new_state.push(self.makeUser(event.data));

            self.setState({users: new_state});
        });

        events.addEventListener('removed', function(event) {
            console.log('3' + event.data);
            let new_state = self.state.users.slice();
            let index = new_state.indexOf(event.data);

            new_state.splice(index, 1);
            self.setState({users: new_state});
        });

        // axios.get(url).then(function (response) {
        //     // console.log(response);
        //
        //     let activeUsers = response.data['active_users'];
        //
        //     if (activeUsers.length === 1) {
        //         activeUsers.push('No active users.');
        //     } else {
        //         let new_state = self.state.users.slice();
        //
        //         activeUsers.forEach(function(username) {
        //             new_state.push(
        //                 <User
        //                     username={username}
        //                     create_terminal={self.props.terminal_factory}
        //                     key={self.childid++}
        //                 />
        //             );
        //         });
        //
        //         self.setState({users: new_state});
        //     }
        //
        // }).catch(function (error) {
        //     console.log(error);
        // });
    }

    componenwillUnmount() {
        this.events.close();
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
