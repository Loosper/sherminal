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
        this.getLayout = this.getLayout.bind(this);
        this.addLayout = this.addLayout.bind(this);
        this.makeLayout = this.makeLayout.bind(this);
        this.onResize = this.onResize.bind(this);

        this.state = {
            loggedIn: false,
            terminals: {},
            layouts: {lg:[], md:[], sm:[], xs:[], xxs:[]}
        };

        this.authToken = '';
        this.terminalsCount = 0;
        this.messageQueue = {};
        this.webSocket = null;

        this.cols = {lg: 12, md: 10, sm: 6, xs: 4, xxs: 1};
        this.breakpoints = {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0};
    }

    signOut(e) {
        this.setState(
            {
                loggedIn: false,
                terminals: {},
                layouts: {lg:[], md:[], sm:[], xs:[], xxs:[]}
            }
        );
        // token for tracking the user
        this.authToken = '';
        this.messageQueue = {};
        this.webSocket = null;
    }

    makeLayout(name, cols, index) { 
        const height = 3;
        const size = this.terminalsCount;

        let layout = {};
        
        if (index) {
            layout.i = name;
        }

        layout.w = cols >= this.cols.sm ? cols / 2 : cols;
        layout.h = height;

        layout.x = size % 2 === 0 ? 0: layout.w;
        layout.y = parseInt(size / 2, 10) * height;

        layout.minW = cols > this.cols.xs ? 3 : cols;
        layout.minH = 2;
        layout.maxH = 4;
        
        return layout;
    }

    getLayout(name) {
        for (let key in this.breakpoints) {
            if (window.innerWidth > this.breakpoints[key]) {
                return this.makeLayout(name, this.cols[key], false);
            }
        }
    }

    addLayout(name) {
        let newLayouts = Object.assign({}, this.state.layouts);

        for (let key in this.cols) {
            newLayouts[key].push(this.makeLayout(name, this.cols[key], true));
        }

        this.setState({layouts: newLayouts});
    }

    async removeLayout(name) {
        let newLayouts = Object.assign({}, this.state.layouts);

        for (let breakpoint in newLayouts) {
            newLayouts[breakpoint] = newLayouts[breakpoint].filter(layout => layout.i !== name);
        }

        await this.setState({layouts: newLayouts});
    }

    getTerminal(path, isLogged) {
        const terminal = {
            component: <Terminal 
                key={path}
                userName={path}
                socketURL={path}
                authToken={this.authToken}
                tearDown={this.removeTerminal}
                setSocket={this.retrieveSocket}
                sendMessage={this.sendMessage}
                terminalId={this.terminalsCount}
                isLogged={isLogged}
                registerMessage={this.addMessageHandler}
                getIsAdmin={this.getIsAdmin}
                data-grid={this.getLayout(path)}
                ref={ref => terminal.ref = ref}/>
        };

        this.terminalsCount++;
        return terminal;
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

        this.addLayout(socketPath);
        let newTerminals = Object.assign({}, this.state.terminals);
        newTerminals[socketPath] = this.getTerminal(socketPath, true);

        this.setState({
            loggedIn: true,
            terminals: newTerminals
        });
    }

    addTerminal(path, isAdmin) {
        if (!this.state.terminals.hasOwnProperty(path)) {
            this.addLayout(path);
            let newTerminals = Object.assign({}, this.state.terminals);
            newTerminals[path] = this.getTerminal(path, false);
            this.setState({terminals: newTerminals});
        }
    }

    removeTerminal(terminalName) {
        if (this.state.terminals.hasOwnProperty(terminalName)) {
            let newTerminals = Object.assign({}, this.state.terminals);
            delete newTerminals[terminalName];
            this.removeLayout(terminalName);

            this.terminalsCount--;
            this.setState({terminals: newTerminals});

            if (this.terminalsCount === 0) {
                this.signOut();
            }
        }
    }

    getTerminals() {
        return Object.values(this.state.terminals).map(terminal => terminal.component);
    }

    onResize(layout, oldItem, newItem, placeholder, e, element) {
        this.state.terminals[newItem.i].ref.onResize();
    }

    render() {
        if (!this.state.loggedIn) {
            return (<LoginHandler onSubmit={this.setupClient}/>);
        } else {
            return (
                <div className="content-wraper">
                    <UserBar
                        registerMessage={this.addMessageHandler}
                        terminal_factory={this.addTerminal}
                        thisUser={this.loggedUser}
                        signOut={this.signOut}
                    />
                    <ResponsiveGridLayout 
                        className="layout" 
                        breakpoints={this.breakpoints}
                        cols={this.cols}
                        containerPadding={[0, 0]}
                        layouts={this.state.layouts}
                        draggableCancel='.terminal-container'
                        compactType='horizontal'
                        onResize={this.onResize}>
                            {this.getTerminals()}
                    </ResponsiveGridLayout>
                </div>
            );
        }
    }
}


export default Window;
