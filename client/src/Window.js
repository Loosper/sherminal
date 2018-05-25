import React, { Component } from 'react';

import Terminal from './Terminal';
import LoginHandler from './LoginHandler';
import UserBar from './UserBar';
import { Responsive, WidthProvider } from 'react-grid-layout';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

class Window extends Component {
    constructor(props) {
        super(props);
        this.setupClient = this.setupClient.bind(this);
        this.addTerminal = this.addTerminal.bind(this);
        this.removeTerminal = this.removeTerminal.bind(this);
        this.retrieveSocket = this.retrieveSocket.bind(this);
        this.addMessageHandler = this.addMessageHandler.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.getIsAdmin = this.getIsAdmin.bind(this);
        this.signOut = this.signOut.bind(this);
        this.zCount = this.zCount.bind(this);
        this.addLayout = this.addLayout.bind(this);

        this.state = {
            loggedIn: false,
            terminals: [],
            opened: [],
            zCounter: 10,
            xCounter: 0,
            yCounter: 0
        };
        // token for tracking the user
        this.authToken = '';
        // this is bad but works
        this.termid = 0;
        this.messageQueue = {};
        this.webSocket = null;

        this.layouts = {
            lg: [],
            md: [],
            sm: [],
            xs: []
        };

        this.cols = {lg: 12, md: 10, sm: 6, xs: 4};
    }

    //paste again
    signOut(e) {
        this.setState({
            loggedIn: false,
            layout: [],
            terminals: [],
            opened: [],
            zCounter: 10
        });

        this.authToken = '';
        this.termid = 0;
        this.messageQueue = {};
        this.webSocket = null;
    }

    zCount() {
        this.setState({zCounter: this.state.zCounter + 1});
        return this.state.zCounter;
    }

    addLayout() {
        const h = 3;

        this.layouts.lg.push(
            {
                i: 'terminal' + this.termid,
                x: this.layouts.lg.length * this.cols.lg, 
                y: parseInt(this.layouts.lg.length / 2), 
                w: this.cols.lg / 2, 
                h: h
            }
        );

        this.layouts.md.push(
            {
                i: 'terminal' + this.termid,
                x: this.layouts.md.length * this.cols.md, 
                y: parseInt(this.layouts.md.length / 2), 
                w: this.cols.md / 2, 
                h: h
            }
        );

        this.layouts.sm.push(
            {
                i: 'terminal' + this.termid,
                x: this.layouts.sm.length * this.cols.sm, 
                y: parseInt(this.layouts.sm.length / 2), 
                w: this.cols.sm, 
                h: h
            }
        );

        this.layouts.xs.push(
            {
                i: 'terminal' + this.termid,
                x: this.layouts.xs.length * this.cols.xs, 
                y: parseInt(this.layouts.xs.length / 2), 
                w: this.cols.xs, 
                h: h
            }
        );
    }

    getTerminal(path, isLogged) {
        this.addLayout();
        return (
            <Terminal
                key={'terminal' + this.termid}
                userName={path}
                socketURL={path}
                authToken={this.authToken}
                tearDown={this.removeTerminal}
                setSocket={this.retrieveSocket}
                sendMessage={this.sendMessage}
                terminalId={this.termid}
                isLogged={isLogged}
                registerMessage={this.addMessageHandler}
                getIsAdmin={this.getIsAdmin}
                zCounter={this.zCount}
            />
        );
    }

    getIsAdmin() {
        return this.isAdmin;
    }

    sendMessage(type, message) {
        this.webSocket.send(JSON.stringify([type, message]));
    }

    // REVIEW: if you need 2 handler, you need lists of handlers
    addMessageHandler(event_name, handler) {
        this.messageQueue[event_name] = handler;
    }

    retrieveSocket(socket) {
        // use only the firs one for comms
        if (this.webSocket !== null)
            return;

        let self = this;
        socket.addEventListener('message', function (event) {
            let data = JSON.parse(event.data);

            // execute handler for message type
            let handler = self.messageQueue[data[0]];
            if (handler !== undefined)
                handler(data[1]);
        });
        this.webSocket = socket;
        // why hasnt it loaded?
        this.webSocket.addEventListener(
            'open',
            () => this.sendMessage('get_users', '')
        );
    }

    setupClient(socketPath, authToken, isAdmin) {
        this.loggedUser = socketPath;
        this.authToken = authToken;
        this.isAdmin = isAdmin;

        let new_opened = this.state.opened.slice();
        new_opened.push(socketPath);
        let new_state = this.state.terminals.slice();
        new_state.push(this.getTerminal(socketPath, true));

        this.termid++;

        this.setState({
            opened: new_opened,
            loggedIn: true,
            terminals: new_state
        });
    }

    addTerminal(path, isAdmin) {
        if (!this.state.opened.includes(path)) {
            let new_terminals = this.state.terminals.slice();
            new_terminals.push(this.getTerminal(path, false));
            let new_opened = this.state.opened.slice();
            new_opened.push(path);
            this.termid++;
            this.setState({opened: new_opened, terminals: new_terminals});
        }
    }

    removeTerminal(terminalName) {
        let newOpened = this.state.opened.slice();
        let new_terminals = this.state.terminals.slice();
        let indexOpened = this.state.opened.indexOf(terminalName);

        new_terminals.splice(indexOpened, 1);
        newOpened.splice(indexOpened, 1);

        this.setState({opened: newOpened, termials: new_terminals});

        if (this.state.opened.length === 0) {
            this.signOut();
        }
    }

    render() {
        if (!this.state.loggedIn) {
            return (<LoginHandler onSubmit={this.setupClient}/>);
        } else {
            return (
                <div className="container-fluid">
                    <div className="content-wraper">
                        <UserBar
                            registerMessage={this.addMessageHandler}
                            terminal_factory={this.addTerminal}
                            thisUser={this.loggedUser}
                            signOut={this.signOut}
                        />
                        <ResponsiveGridLayout className="layout" layouts={this.layouts}
                            breakpoints={{lg: 1200, md: 996, sm: 768, xs: 480}}
                            cols={this.cols}
                        >
                            {this.state.terminals}
                        </ResponsiveGridLayout>
                    </div>
                </div>
            );
        }
    }
}


export default Window;
