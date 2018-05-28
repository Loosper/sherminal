import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
const CloseButton = require('./images/close-button.png');

class YesNoNotification extends Component {
    constructor(props) {
        super(props);

        this.clickNo = this.clickNo.bind(this);
        this.clickYes = this.clickYes.bind(this);
        this.ignore = this.ignore.bind(this);

        this.state = {
            isResponded: false
        };
    }

    clickYes() {
        this.props.respondYes();
        this.setState({ isResponded: true });
    }

    clickNo() {
        this.props.respondNo();
        this.setState({ isResponded: true });
    }

    ignore() {
        this.props.ignore();
        this.setState({ isResponded: true });
    }

    // TODO: Animations
    render() {
        if (!this.state.isResponded) {
            return (
                <div className="notification">
                    <img
                        className="close-button"
                        src={CloseButton}
                        onClick={this.ignore}
                        alt="close-button"
                        style={{position: 'fixed', margin: '-18px 10px', float: 'left'}}
                    />
                    <div className="notification-text">
                        {this.props.message}
                    </div>
                    <div>
                        <button className="btn btn-notification btn-outline-success" onClick={this.clickYes}>
                            {this.props.yesMessage}
                        </button>
                        <span style={{padding: '0 10px'}}/>
                        <button className="btn btn-notification btn-outline-secondary" onClick={this.clickNo}>
                            {this.props.noMessage}
                        </button>
                    </div>
                </div>
            );
        }
        return null;
    }
}

export default YesNoNotification;
