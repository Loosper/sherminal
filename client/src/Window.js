import React, { Component } from 'react';

import Particles from 'react-particles-js';
import Terminal from './Terminal';
import LoginHandler from './LoginHandler';
import UserBar from './UserBar';
import PermissionManager from './PermissionManager';
import { Responsive, WidthProvider } from 'react-grid-layout';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './styles/main.css';

const ResponsiveGridLayout = WidthProvider(Responsive);
const ParticleParams = require('./particles/particlesjs-config.json');

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
        this.updatePermissionManager = this.updatePermissionManager.bind(this);
        this.getAllowed = this.getAllowed.bind(this);
        this.getDenied = this.getDenied.bind(this);
        this.getIgnored = this.getIgnored.bind(this);
        this.getNotificationsCount = this.getNotificationsCount.bind(this);
        this.handleChangeParticles = this.handleChangeParticles.bind(this);

        this.state = {
            loggedIn: false,
            terminals: {},
            layouts: {lg:[], md:[], sm:[], xs:[], xxs:[]},
            showPermissionManager: false,
            particles: true
        };

        this.authToken = '';
        this.terminalsCount = 0;
        this.messageQueue = {};
        this.webSocket = null;
        
        this.cols = {lg: 12, md: 10, sm: 6, xs: 4, xxs: 1};
        this.breakpoints = {lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0};
        this.particles = <Particles params={ParticleParams} 
            style={{height:"100%", left: 0, position: "fixed", top: 0, width: "100%", zIndex: -1}}
        />;
    }

    signOut(e) {
        this.setState(
            {
                loggedIn: false,
                terminals: {},
                layouts: {lg:[], md:[], sm:[], xs:[], xxs:[]},
                showPermissionManager: false
            }
        );
        // token for tracking the user
        this.authToken = '';
        this.terminalsCount = 0;
        this.messageQueue = {};
        this.webSocket = null;
    }

    makeLayout(name, cols, index) { 
        const height = 3;
        let layout = {};
        
        if (index) {
            layout.i = name;
        }

        layout.w = cols >= this.cols.sm ? cols / 2 : cols;
        layout.h = height;

        layout.x = this.terminalsCount % 2 === 0 ? 0: layout.w;
        layout.y = parseInt(this.terminalsCount / 2, 10) * height;

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

    removeLayout(name) {
        let newLayouts = Object.assign({}, this.state.layouts);

        for (let breakpoint in newLayouts) {
            newLayouts[breakpoint] = newLayouts[breakpoint].filter(layout => layout.i !== name);
        }

        this.setState({layouts: newLayouts});
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

        this.terminal = newTerminals[socketPath].ref;
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

            // removing this because:
            // 1. it doesnt really make sense since you can still open your terminal
            // 2. someone can type exit on your terminal and log you out
            // if (this.terminalsCount === 0) {
            //     this.signOut();
            // }
        }
    }

    getTerminals() {
        return Object.values(this.state.terminals).map(terminal => terminal.component);
    }

    getAllowed() {
        return this.terminal.getNotifications().getAllowed();
    }

    getDenied() {
        return this.terminal.getNotifications().getDenied();
    }

    getIgnored() {
        return this.terminal.getNotifications().getIgnored();
    }

    getNotificationsCount() {
        return this.terminal == null || this.terminal.getNotifications() == null ? 
            0 : this.terminal.getNotifications().getCount();
    }

    onResize(layout, oldItem, newItem, placeholder, e, element) {
        this.state.terminals[newItem.i].ref.onResize();
    }

    updatePermissionManager(toShow) {
        this.setState({showPermissionManager: toShow});
    }

    handleChangeParticles(checked) {
        this.setState({particles: checked});
    }

    getContent() {
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
                        showPermissionManager={this.updatePermissionManager}
                        notificationCount={this.getNotificationsCount}
                        particles={this.state.particles}
                        handleChangeParticles={this.handleChangeParticles}
                    />
                    <ResponsiveGridLayout 
                        className="layout" 
                        breakpoints={this.breakpoints}
                        cols={this.cols}
                        containerPadding={[0, 0]}
                        layouts={this.state.layouts}
                        draggableCancel='.terminal-container'
                        onResize={this.onResize}
                        onResizeStop={this.onResize}
                        children={this.getTerminals()}
                        verticalCompact
                    />
                    {this.state.showPermissionManager && 
                    <PermissionManager
                        close={this.updatePermissionManager}
                        allowed={this.getAllowed}
                        denied={this.getDenied}
                        ignored={this.getIgnored}
                        notifications={this.terminal.getNotifications()}
                    />}
                </div>
            );
        }
    }

    render() {
        return (
            <div>
                {this.state.particles && this.particles}
                {this.getContent()}
            </div>
        );
    }
}


export default Window;
