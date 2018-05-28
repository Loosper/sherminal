import React, { Component } from 'react';

import './styles/main.css';

const CloseButton = require('./images/close-button.png');

export default class PermissionManager extends Component {
    constructor(props) {
        super(props);

        this.close = this.close.bind(this);
    }

    close() {
        this.props.close(false);
    }

    getAllowed() {
        return this.props.allowed().length === 0 ? null : (
            <div>
                <h5>Allowed access:</h5>
                {this.props.allowed().map(x => 
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
                            onClick={this.props.notifications().respondNo}>
                            Kick
                        </button>
                    </div>
                )}
            </div>
        );
    }

    getDenied() {
        return this.props.denied().length === 0 ? null : (
            <div>
                <h5>Denied access:</h5>
                {this.props.denied().map(x => 
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
                            onClick={this.props.notifications().respondYes}>
                            Allow
                        </button>
                    </div>
                )}
            </div>
        );
    }

    getIgnored() {
        return this.props.ignored().length === 0 ? null : (
            <div>
                <h5>Ignored:</h5>
                {this.props.ignored().map(x => 
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
                            onClick={this.props.notifications().respondNo}>
                            Deny
                        </button>
                        <button className="btn btn-notification btn-permission btn-outline-success" 
                            onClick={this.props.notifications().respondYes}>
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
                            {this.getAllowed()}
                            {this.getDenied()}
                            {this.getIgnored()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
