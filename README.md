## Sherminal
Sherminal is a shared terminal implementation for use in a web browser. It is designed to provide a shared always connected environment in class. Students can view and help each other's work while an optional teacher is able to instantly share materials and monitor his students. __Copying off a whiteboard is a thing of the past__.

<!-- expand this -->
# Features
* User file isolation
* User communication - send files
* Permissioning system between users
* Full freedom of each and every user - the frustration with not having permission to install packages is gone! Every user's is free to do whatever they like.

# Running
The frontend server:

```sh
$ npm install
```
```sh
$ npm start
```

The backend:
```sh
pip3 install -r requirements.txt
```
```sh
sudo python3 server/server.py
```

### Optional
* You can edit the .env file to set the path to the backend
* For a native file sharing experience you should place `utilites/send.py` in a system directory like `/usr/local/bin/`

# Notes
The app uses `chroot` and `mount` for user isolation and because of this needs to be ran with superuser privileges. It would be advised to use a virtual machine at this stage in the project.

# Dependencies
* [Terminado](https://github.com/jupyter/terminado) - The xterm backend. Forwards the console to a websocket.
* [XTerm.js](https://github.com/xtermjs/xterm.js) - Terminal emulator in the browser.


# System requirements
Tested on:

* Python 3.6
* node v8.9
* npm v5.7

# Contributors
[Loosper](https://github.com/loosper) - backend
[denishristov](https://github.com/denishristov) - frontend

# License
This project is licensed under the GPLv2.0
