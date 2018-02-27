import React, { Component } from 'react';
import axios from 'axios';


import './styles/login.css';
import 'bootstrap/dist/css/bootstrap.min.css';


class LoginHandler extends Component {
    constructor(props) {
        super(props);
        this.updateUsername = this.updateUsername.bind(this);
        this.login = this.login.bind(this);

        this.URL = this.props.URL;
        this.state = {username: ''};
    }

    login(event) {
        let self = this;
        axios.post(
            this.URL + 'login',
            {username: this.state.username}
        ).then(function (response) {
            // console.log(response.data);
            self.props.onSubmit(response.data['terminal_path']);
        }).catch(function (error) {
            console.log(error.response.status);
            console.log(error.response.data);
        });
    }

    updateUsername(event) {
        this.setState({username: event.target.value});
    }

    render() {
        return (
            <div className="container">
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
                        <div className="col-md-12 login-btn-container">
                            <a  onClick={this.login}
                                className=" btn btn-secondary"
                            >Sign in <span className="glyphicon glyphicon-log-in" /></a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


export default LoginHandler;
