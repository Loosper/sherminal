import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';


class YesNoNotification extends Component {
    constructor(props) {
        super(props);

        this.clickNo = this.clickNo.bind(this);
        this.clickYes = this.clickYes.bind(this);

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

    // TODO: Animations
    render() {
        if (!this.state.isResponded) {
            return (
                <div className="col notification">
                    <div className="row notification-text">
                        <div>{this.props.message}</div>
                    </div>
                    <div className="row button-row">
                        <div className="col"/>
                        <button 
                            className="btn btn-outline-success notification-button"
                            onClick={this.clickYes}
                        >
                            {this.props.yesMessage}
                        </button>
                        <button 
                            className="btn btn-outline-secondary notification-button"
                            onClick={this.clickNo}
                        >
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
