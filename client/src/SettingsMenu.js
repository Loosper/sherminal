import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';


class SettingsMenu extends Component {
    render() {
        return (
            <div>
                <h6 className="dropdown-header">Settings</h6>
                <a className="dropdown-item" onClick={this.props.signOut}>Sign out</a>
            </div>
        );
    }
}


export default SettingsMenu;
