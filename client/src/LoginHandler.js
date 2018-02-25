import React, { Component } from 'react';

import './styles/login.css';
import 'bootstrap/dist/css/bootstrap.min.css';

class LoginHandler extends Component {
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
                            <input className="form-control" type="text" placeholder="User name"  />
                        </div>
                    </div>
                    <div className="row ">
                        <div className="col-md-12 login-btn-container">
                            <a className=" btn btn-secondary">Sign in <span className="glyphicon glyphicon-log-in"></span> </a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


export default LoginHandler;
