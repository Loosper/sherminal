import React, { Component } from 'react';
import User from './User';


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

        // events.onopen = function(event) {
        //     console.log(event);
        // };

        events.onmessage = function(event) {
            let users = JSON.parse(event.data);
            let user_state = [];

            for (let user of users) {
                console.log(user);
                user_state.push(self.makeUser(user));
            }
            self.setState({users: user_state});
        };

        events.addEventListener('added', function(event) {
            let new_state = self.state.users.slice();

            new_state.push(self.makeUser(event.data));

            self.setState({users: new_state});
        });

        events.addEventListener('removed', function(event) {
            let new_state = self.state.users.slice();
            let index = new_state.indexOf(event.data);

            new_state.splice(index, 1);
            self.setState({users: new_state});
        });
    }

    componentwillUnmount() {
        this.events.close();
    }

    render() {
        return(
            <div className="col">
                {this.state.users}
            </div>
        );
    }
}

export default UserBar;
