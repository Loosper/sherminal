import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';


class SettingsMenu extends Component {
    render() {
        return (
            <div className="col-md col-sm text-right" onClick={this.props.signOut}>
                Sign out
            </div>
        );
    }
}


export default SettingsMenu;
