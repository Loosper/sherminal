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
        this.getLayout = this.getLayout.bind(this);
        this.addLayout = this.addLayout.bind(this);
        this.makeLayout = this.makeLayout.bind(this);
        this.onResize = this.onResize.bind(this);

        this.state = {
            loggedIn: false,
            terminals: [],
            opened: [],
            refs: {},
            zCounter: 10,
            layouts: {lg:[], md:[], sm:[], xs:[], xxs:[]}
        };

        this.authToken = '';
        this.termid = 0;
        this.messageQueue = {};
        this.webSocket = null;

        this.cols = {lg: 12, md: 10, sm: 6, xs: 4, xxs: 1};
        this.breakpoints = {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0};
    }

    signOut(e) {
        this.setState(
            {
                loggedIn: false,
                terminals: [],
                opened: [],
                zCounter: 10,
                layouts: {lg:[], md:[], sm:[], xs:[], xxs:[]}
            }
        );
        // token for tracking the user
        this.authToken = '';
        this.termid = 0;
        this.messageQueue = {};
        this.webSocket = null;
    }

    zCount() {
        this.setState({zCounter: this.state.zCounter + 1});
        return this.state.zCounter;
    }

    makeLayout(cols, index) { 
        const height = 3;
        const size = this.state.opened.length;

        let layout = {};
        
        if (index) {
            layout.i = 'terminal' + this.termid;
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

    getLayout() {
        for (let key in this.breakpoints) {
            if (window.innerWidth > this.breakpoints[key]) {
                return this.makeLayout(this.cols[key], false);
            }
        }
    }

    addLayout() {
        let newLayouts = {};

        for (let key in this.cols) {
            newLayouts[key] = this.state.layouts[key].slice();
            newLayouts[key].push(this.makeLayout(this.cols[key], true));
        }

        this.setState({layouts: newLayouts});
    }

    getTerminal(path, isLogged) {
        const key = 'terminal' + this.termid;
        this.addLayout();
        return (
            <Terminal
                key={key}
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
                data-grid={this.getLayout()}
                ref={ref => {this.state.refs[key] = ref}}
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

    onResize(layout, oldItem, newItem, placeholder, e, element) {
        this.state.refs[newItem.i].onResize();
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
                        onResize={this.onResize}
                    >
                        {this.state.terminals}
                    </ResponsiveGridLayout>
                </div>
            );
        }
    }
}


export default Window;
