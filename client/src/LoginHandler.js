import React, { Component } from 'react';
import './styles/login.css';
import './styles/bootstrap.min.css';

class LoginHandler extends Component {
    
      
    render() {
        return (
            <div class="container">  
                <div class="col-lg-6 col-md-6 col-sm-8  loginbox">
                    <div class=" row">
                        <div class="col-md-12">
                            <div class="singtext">Sherminal</div>   
                        </div>
                                 
                    </div>
                    <div class=" row loginbox_content ">                        
                        <div class="col-md-12" >
                            <input class="form-control" type="text" placeholder="User name"  />
                        </div>
                    </div>
                    <div class="row ">                   
                        <div class="col-md-12 login-btn-container">                        
                            <a href="#" class=" btn btn-secondary">Sign in <span class="glyphicon glyphicon-log-in"></span> </a> 
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}



export default LoginHandler;

