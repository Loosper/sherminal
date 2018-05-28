import React, { Component } from 'react';
import YesNoNotification from './YesNoNotification';


class NotificationBar extends Component {
    constructor(props) {
        super(props);
        this.add_notification = this.add_notification.bind(this);
        this.make_notification = this.make_notification.bind(this);
        this.notification_write = this.notification_write.bind(this);
        this.notification_file_write = this.notification_file_write.bind(this);
        this.respond = this.respond.bind(this);
        this.ignore = this.ignore.bind(this);

        this.state = {
            notifications: [],
            allowed: [],
            denied: [],
            ignored: []
        };
        
        this.id = 0;
    }

    getCount() {
        return this.state.allowed.length + this.state.denied.length + this.state.ignored.length;
    }

    getAllowed() {
        return this.state.allowed;
    }

    getDenied() {
        return this.state.denied;
    }

    getIgnored() {
        return this.state.ignored;
    }

    respond(msg_type, message) {
        this.props.sendMessage(msg_type, message);
    }

    // This needs types
    make_notification(message, yes, no, ignore, yesMessage, noMessage) {
        return (
            <YesNoNotification
                key={this.id++}
                message={message}
                respondYes={yes}
                respondNo={no}
                yesMessage={yesMessage}
                noMessage={noMessage}
                ignore={ignore}
            />
        );
    }

    respondYes(data) {
        let newAllowed = this.state.allowed.slice();
        newAllowed.push(data);
        this.respond('allow_write', data['host']);
        this.setState({allowed: newAllowed});
    }

    respondNo(data) {
        let newDenied = this.state.denied.slice();
        newDenied.push(data);
        this.respond('deny_write', data['host']);
        this.setState({denied: newDenied});
    }

    ignore(data) {
        let newIgnored = this.state.ignored.slice();
        newIgnored.push(data);
        this.setState({ignored: newIgnored});
    }

    // pleaseCamel murzi me da fix
    notification_write(data) {
        let notification = this.make_notification(
            data['host'] + ' wants access to your terminal',
            () => this.respondYes(data),
            () => this.respondNo(data),
            () => this.ignore(data),
            'Accept',
            'Deny'
        );
        this.add_notification(notification);
    }

    notification_file_write(data) {
        let notification = this.make_notification(
            data['from'] + ' wants to send you ' + data['from'],
            () => this.respond(
                'allow_file_write',
                data
            ),
            () => this.respond('deny_file_write', data['from']),
            null,
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
        if (this.props.isLogged) {
            this.props.registerMessage(
                'notification_write',
                this.notification_write
            );
            this.props.registerMessage(
                'notification_file_write',
                this.notification_file_write
            );
        }
    }

    render() {
        return (
            <div className="notification-container">
                {this.state.notifications}
            </div>
        );
    }
}


export default NotificationBar;
