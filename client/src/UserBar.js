import React, { Component } from 'react';
import User from './User';
import { ContextMenu, Item, Separator, Submenu, ContextMenuProvider } from 'react-contexify';

class UserBar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            users: [],
            thisUser: null
        };

        this.events = null;
        this.childid = 0;
    }

    makeUser(data, isLoggedUser) {
        return (
            <User
                username={data.host}
                avatar={data.avatar}
                create_terminal={this.props.terminal_factory}
                key={this.childid++}
                signOut={this.props.signOut}
                isLoggedUser={isLoggedUser}
            />
        );
    }

    componentDidMount() {
        let self = this;

        this.props.registerMessage('initial_users', function(users) {
            let user_state = [];

            for (let user of users) {
                if (user.host === self.props.thisUser) {
                    if (self.state.thisUser == null)
                        self.setState({thisUser: self.makeUser(user, true)});
                } else {
                    user_state.push(self.makeUser(user, false));
                }
            }
            self.setState({users: user_state});
        });

        this.props.registerMessage('add_user', function(user) {
            let new_state = self.state.users.slice();

            if (user.host === self.props.thisUser) {
                if (self.state.thisUser == null)
                    self.setState({thisUser: self.makeUser(user, true)});
            } else {
                new_state.push(self.makeUser(user, false));
            }

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
                <div className="this-user">
                    <ContextMenuProvider id='user_menu'>
                        {this.state.thisUser}
                    </ContextMenuProvider>
                    <ContextMenu id='user_menu'>
                        <Submenu label="Notifications">
                            {this.state.notifications}
                        </Submenu>
                        <Separator/>
                        <Item onClick={this.props.signOut}>Sign Out</Item>
                    </ContextMenu>
                </div>
            </div>
        );
    }
}

export default UserBar;
