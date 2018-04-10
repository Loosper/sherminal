import React, { Component } from 'react';
import axios from 'axios';


import './styles/login.css';
import './styles/main.css';

import 'bootstrap/dist/css/bootstrap.min.css';


class LoginHandler extends Component {
    constructor(props) {
        super(props);
        this.updateUsername = this.updateUsername.bind(this);
        this.login = this.login.bind(this);

        this.state = {username: ''};
    }

    login(event) {
        event.preventDefault();
        let self = this;
        let url = 'http://' + process.env.REACT_APP_HOST + '/login';

        // TODO: just use fetch promises. Removes a dependency
        axios.post(
            url,
            {username: this.state.username},
            {timeout: 1000}
        ).then(function (response) {
            // console.log(response.data['terminal_path']);
            self.props.onSubmit(
                response.data['terminal_path'],
                response.data['auth_token']
            );
        }).catch(function (error) {
            // server responded with error
            if (error.response) {
                console.log('Server responded: ' + error.response.status);
                console.log(error.response.data);
            } else if (error.request) {
                console.log('No response from: ' + url);
            } else {
                console.log('Failed to send: ' + error);
            }
        });
    }

    updateUsername(event) {
        this.setState({username: event.target.value});
    }

    render() {
        return (
            // TODO: fix glyphicon
            <form className="container" onSubmit={this.login}>
                <div className="col-lg-6 col-md-6 col-sm-8  loginbox">
                    <div className=" row">
                        <div className="col-md-12">
                            <div className="singtext">Sherminal</div>
                        </div>

                    </div>
                    <div className=" row loginbox_content ">
                        <div className="col-md-12" >
                            <input
                                className="form-control" type="text"
                                placeholder="User name"
                                value={this.state.username}
                                onChange={this.updateUsername}
                            />
                        </div>
                    </div>
                    <div className="row ">
                        <button className=" btn btn-secondary" type='submit'>
                            Sign in
                        </button>
                    </div>
                </div>
            </form>
        );
    }
}


export default LoginHandler;
