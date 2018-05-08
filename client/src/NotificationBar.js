import React, { Component } from 'react';

import YesNoNotification from './YesNoNotification';

import 'bootstrap/dist/css/bootstrap.min.css';


class NotificationBar extends Component {
    constructor(props) {
        super(props);
        this.add_notification = this.add_notification.bind(this);
        this.make_notification = this.make_notification.bind(this);
        this.notification_write = this.notification_write.bind(this);
        this.notification_file_write = this.notification_file_write.bind(this);
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
    make_notification(message, yes, no, yesMessage, noMessage) {
        return (
            <YesNoNotification
                key={this.id++}
                message={message}
                respondYes={yes}
                respondNo={no}
                yesMessage={yesMessage}
                noMessage={noMessage}
            />
        );
    }

    // pleaseCamel murzi me da fix
    notification_write(data) {
        let notification = this.make_notification(
            data['host'] + ' wants access to your terminal',
            () => this.respond('allow_write', data['host']),
            () => this.respond('deny_write', data['host']),
            'Accept',
            'Deny'
        );
        this.add_notification(notification);
    }

    notification_file_write(data) {
        let notification = this.make_notification(
            'User ' + data['from'] + ' wants to send you ' + data['from'],
            () => this.respond(
                'allow_file_write',
                data
            ),
            () => this.respond('deny_file_write', data['from']),
            'Accept',
            'Deny'
        );
        this.add_notification(notification);
    }

    add_notification(data) {
        let new_state = this.state.notifications.slice();
        new_state.push(data);
        this.setState({notifications: new_state});
    }

    componentDidMount() {
        // TODO: skip this if not the first terminal
        this.props.registerMessage(
            'notification_write',
            this.notification_write
        );
        this.props.registerMessage(
            'notification_file_write',
            this.notification_file_write
        );
    }

    render() {
        return (
            <div>
                {this.state.notifications}
            </div>
        );
    }
}


export default NotificationBar;
