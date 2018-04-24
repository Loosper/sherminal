import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';


class NotificationBar extends Component {
    constructor(props) {
        super(props);
        this.add_notification = this.add_notification.bind(this);
        this.make_notification = this.make_notification.bind(this);
        this.respond = this.respond.bind(this);

        this.state = {
            notifications: []
        };
        this.id = 0;
    }

    respond(msg_type, message) {
        this.props.sendMessage(msg_type, message);
    }

    // This needs types
    make_notification(user) {
        return (<div key={this.id++}>
            <div>User {user} wants write access</div>
            <button onClick={() => this.respond('allow_write', user)}> YES </button>
            <button onClick={() => this.respond('deny_write', user)}> NO </button>
        </div>);
    }

    add_notification(data) {
        console.log(data['host']);

        let new_state = this.state.notifications.slice();
        new_state.push(this.make_notification(data['host']));
        this.setState({notifications: new_state});
    }

    componentDidMount() {
        this.props.registerMessage('notification_write', this.add_notification);
    }

    render() {
        return (
            <div className="col-md col-sm text-right">
                {this.state.notifications}
            </div>
        );
    }
}


export default NotificationBar;
