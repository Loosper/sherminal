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

    makeUser(data) {
        return <User
            username={data.host}
            avatar={data.avatar}
            create_terminal={this.props.terminal_factory}
            key={this.childid++}
        />;
    }

    componentDidMount() {
        let self = this;

        this.props.registerMessage('initial_users', function(users) {
            let user_state = [];

            for (let user of users) {
                user_state.push(self.makeUser(user));
            }
            self.setState({users: user_state});
        });

        this.props.registerMessage('add_user', function(user) {
            let new_state = self.state.users.slice();

            new_state.push(self.makeUser(user));

            self.setState({users: new_state});
        });

        this.props.registerMessage('remove_user', function(user) {
            let new_state = self.state.users.slice();
            let index = new_state.indexOf(user);

            new_state.splice(index, 1);
            self.setState({users: new_state});
        });
    }

    render() {
        return (
            <div className="row userbar">
                {this.state.users}
            </div>
        );
    }
}

export default UserBar;
