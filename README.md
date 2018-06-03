## Sherminal
Sherminal is a shared terminal implementation for use in a web browser. It is designed to provide a shared always connected environment in class. Students can view and help each other's work while an optional teacher is able to instantly share materials and monitor his students. __Copying off a whiteboard is a thing of the past__.

<!-- expand this -->
# Features
* View another user's terminal session - you can click on the avatar of every user and see what they are doing *in real time*.
* User file isolation - every user gets a clean environment, separate form everyone else.
* User communication - users can send files between each other for fast sharing of work.
* Permissioning system between users - anyone can request permission to write in your terminal session. A great way to keep progressing when one member of hte group feel stuck.
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
* [Loosper](https://github.com/loosper) - backend
* [denishristov](https://github.com/denishristov) - frontend

# Trivia
This is a course project for Software engineering class. It was build with its constraints and deadlines in mind.

# License
This project is licensed under the GPLv2.0
