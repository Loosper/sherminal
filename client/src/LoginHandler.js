import React, { Component } from 'react';

import './styles/login.css';
import './styles/main.css';

import 'bootstrap/dist/css/bootstrap.min.css';


class LoginHandler extends Component {
    constructor(props) {
        super(props);
        this.updateUsername = this.updateUsername.bind(this);
        this.updatePassword = this.updatePassword.bind(this);
        this.login = this.login.bind(this);

        this.state = {username: '', password: ''};
    }

    login(event) {
        event.preventDefault();
        let self = this;
        let url = 'http://' + process.env.REACT_APP_HOST + '/login';
        let data = {username: this.state.username, password: this.state.password};

        // TODO: timeout
        fetch(
            url, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {'Content-Type': 'application/json'},
                mode: 'cors'
            }
        ).then(function(response) {
            if (response.status !== 200) {
                throw new Error(response.status);
            }
            return response.json();
        }).then(function(data) {
            self.props.onSubmit(
                data['terminal_path'],
                data['auth_token'],
                data['administrator']
            );
        }).catch(function (error) {
            if (error.message === '401') {
                // TODO: show this info to the user
                console.log('No perms');
            } else {
                console.log('Error with the request');
                console.log(error);
            }
        });
    }

    updateUsername(event) {
        this.setState({username: event.target.value});
    }

    updatePassword(event) {
        this.setState({password: event.target.value});
    }

    render() {
        return (
            <form className="container" onSubmit={this.login}>
                <div className="col-lg-6 col-md-6 col-sm-8 loginbox">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="singtext">termi.net</div>
                        </div>

                    </div>
                    <div className=" row loginbox_content ">
                        <div className="col-md-12" >
                            <input
                                className="form-control" type="text"
                                placeholder="username"
                                value={this.state.username}
                                onChange={this.updateUsername}
                            />
                            <input
                                className="form-control" type="text"
                                placeholder="password (optional)"
                                value={this.state.password}
                                onChange={this.updatePassword}
                                style={{marginTop: 10}}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col"/>
                        <button className=" btn btn-outline-secondary submit" type='submit'>
                            Sign in
                        </button>
                    </div>
                </div>
            </form>
        );
    }
}


export default LoginHandler;
