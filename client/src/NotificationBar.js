import React, { Component } from 'react';
import YesNoNotification from './YesNoNotification';
import { Transition, animated } from 'react-spring';

class NotificationBar extends Component {
    constructor(props) {
        super(props);
        this.add_notification = this.add_notification.bind(this);
        this.make_notification = this.make_notification.bind(this);
        this.notification_write = this.notification_write.bind(this);
        this.notification_file_write = this.notification_file_write.bind(this);
        this.respond = this.respond.bind(this);
        this.ignore = this.ignore.bind(this);
        this.deleteNotification = this.deleteNotification.bind(this);

        this.state = {
            notifications: {},
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
    make_notification(message, yes, no, ignore, yesMessage, noMessage, host) {
        return (
            <YesNoNotification
                key={this.id++}
                message={message}
                respondYes={yes}
                respondNo={no}
                yesMessage={yesMessage}
                noMessage={noMessage}
                ignore={ignore}
                id={host}
                deleteNotification={this.deleteNotification}
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

    kick(data) {
        let newAllowed = this.state.allowed.slice();
        newAllowed = newAllowed.filter(x => x.host !== data.host);
        this.respond('deny_write', data['host']);
        this.setState({allowed: newAllowed});
    }

    deniedToAllowed(data) {
        let newDenied = this.state.denied.slice();
        let newAllowed = this.state.allowed.slice();
        newDenied = newDenied.filter(x => x.host !== data.host);
        newAllowed.push(data);
        this.respond('allow_write', data['host']);
        this.setState({allowed: newAllowed, denied: newDenied});
    }

    ignoredToAllowed(data) {
        let newIgnored = this.state.ignored.slice();
        let newAllowed = this.state.allowed.slice();
        newIgnored = newIgnored.filter(x => x.host !== data.host);
        newAllowed.push(data);
        this.respond('allow_write', data['host']);
        this.setState({allowed: newAllowed, ignored: newIgnored});
    }

    ignoredToDenied(data) {
        let newIgnored = this.state.ignored.slice();
        let newDenied = this.state.denied.slice();
        newIgnored = newIgnored.filter(x => x.host !== data.host);
        newDenied.push(data);
        this.respond('allow_write', data['host']);
        this.setState({denied: newDenied, ignored: newIgnored});
    }

    // pleaseCamel murzi me da fix
    notification_write(data) {
        let notification = this.make_notification(
            data['host'] + ' wants access to your terminal',
            () => this.respondYes(data),
            () => this.respondNo(data),
            () => this.ignore(data),
            'Accept',
            'Deny',
            data.host
        );
        this.add_notification(notification, data.host);
    }

    notification_file_write(data) {
        let notification = this.make_notification(
            data['from'] + ' wants to send you ' + data['file'],
            () => this.respond(
                'allow_file_write',
                data
            ),
            () => this.respond('deny_file_write', data['from']),
            null,
            'Accept',
            'Deny',
            data.host
        );
        this.add_notification(notification, data.host);
    }

    add_notification(notification, key) {
        let newNotifications = Object.assign({}, this.state.notifications);
        newNotifications[key] = notification;
        this.setState({notifications: newNotifications});
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

    deleteNotification(key) {
        let newNotifications = Object.assign({}, this.state.notifications);
        delete newNotifications[key];
        this.setState({notifications: newNotifications});
    }

    render() {
        return (
            <div className="notification-container">
                <Transition
                    native
                    keys={Object.keys(this.state.notifications)}
                    from={{ opacity: 0, height: 0 }}
                    enter={{ opacity: 1, height: 157 }}
                    leave={{ opacity: 0, height: 0 }}>
                    {Object.values(this.state.notifications).map(n => styles =>
                        <animated.div style={{...styles }}>
                            {n}
                        </animated.div>
                    )}
                </Transition>
            </div>
        );
    }
}


export default NotificationBar;
