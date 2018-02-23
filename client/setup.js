window.addEventListener('load',function () {
    Terminal.applyAddon(terminado);

    var term = new Terminal();

    let socketURL = 'ws://' + location.hostname +
            ((location.port) ? (':' + location.port) : '') + "/websocket/2";

    let socket = new WebSocket(socketURL);
    term.terminadoAttach(socket);

    term.open(document.getElementById('terminal-container'));
});
