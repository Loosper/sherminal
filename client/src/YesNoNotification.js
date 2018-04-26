import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';


class YesNoNotification extends Component {
    render() {
        return (
            <div>
                <div>{this.props.message}</div>
                <button onClick={this.props.respondYes}> YES </button>
                <button onClick={this.props.respondNo}> NO </button>
            </div>
        );
    }
}

export default YesNoNotification;
