import React, { Component } from 'react';

import './styles/main.css';

const CloseButton = require('./images/close-button.png');

export default class PermissionManager extends Component {
    constructor(props) {
        super(props);

        this.state = {
            allowed: [],
            denied: [],
            ignored: []
        }

        this.close = this.close.bind(this);
        this.update = this.update.bind(this);
    }

    async componentDidMount() {
        this.update();
    }

    async update(callback) {
        if (callback) {
            await callback();
        }

        await this.setState({
            allowed: this.props.allowed(),
            denied: this.props.denied(),
            ignored: this.props.ignored()
        });

        if (this.state.allowed.length + this.state.denied.length + this.state.ignored.length === 0) {
            this.close();
        }
    }

    close() {
        this.props.close(false);
    }

    getAllowed() {
        return this.state.allowed.length === 0 ? null : (
            <div>
                <h5>Allowed access:</h5>
                {this.state.allowed.map(x => 
                    <div key={x.host} className="user-permission-container">
                        <img
                            src={x.avatar}
                            className="avatar"
                            alt="avatar"
                        />
                        <h6 style={{display: 'inline'}}>
                            {x.host}
                        </h6>
                        <button className="btn btn-notification btn-outline-danger btn-permission" 
                            onClick={() => this.update(() => this.props.notifications.kick(x))}>
                            Kick
                        </button>
                    </div>
                )}
            </div>
        );
    }

    getDenied() {
        return this.state.denied.length === 0 ? null : (
            <div>
                <h5>Denied access:</h5>
                {this.state.denied.map(x => 
                    <div key={x.host} className="user-permission-container">
                        <img
                            src={x.avatar}
                            className="avatar"
                            alt="avatar"
                        />
                        <h6 style={{display: 'inline'}}>
                            {x.host}
                        </h6>
                        <button className="btn btn-notification btn-outline-success btn-permission" 
                            onClick={() => this.update(() => this.props.notifications.deniedToAllowed(x))}>
                            Allow
                        </button>
                    </div>
                )}
            </div>
        );
    }

    getIgnored() {
        return this.state.ignored.length === 0 ? null : (
            <div>
                <h5>Ignored:</h5>
                {this.state.ignored.map(x => 
                    <div key={x.host} className="user-permission-container">
                        <img
                            src={x.avatar}
                            className="avatar"
                            alt="avatar"
                        />
                        <h6 style={{display: 'inline'}}>
                            {x.host}
                        </h6>
                        <button className="btn btn-notification btn-permission btn-outline-danger" 
                            onClick={() => this.update(() => this.props.notifications.ignoredToDenied(x))}>
                            Deny
                        </button>
                        <button className="btn btn-notification btn-permission btn-outline-success" 
                            onClick={() => this.update(() => this.props.notifications.ignoredToAllowed(x))}>
                            Allow
                        </button>
                    </div>
                )}
            </div>
        );
    }

    render() {
        return (
            <div className="permissions-container">
                <div className="permissions-window">
                    <img
                        className="close-button"    
                        src={CloseButton}
                        onClick={this.close}
                        alt="close-button"
                        style={{position: 'relative'}}
                    />
                    <div className="permissions-content">
                        <h1>Permission Manager</h1>
                        <div style={{marginTop: '24px', overflowY:'scroll'}}>
                            {this.getIgnored()}
                            {this.getAllowed()}
                            {this.getDenied()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
