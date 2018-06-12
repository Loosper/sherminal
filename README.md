# termi.net
Sherminal is a shared terminal implementation for use in a web browser. It is designed to provide a shared always connected environment in class. Students can view and help each other's work while an optional teacher is able to instantly share materials and monitor his students. __Copying off a whiteboard is a thing of the past__.

[Demo video: ](https://www.youtube.com/watch?v=osFXtbgEgZc&feature=youtu.be)
 
## Introduction
Most introductory programming classes usually involve two modules: theory lectures and practical code examples. In our experience the code examples are done by the teacher in real-time on a whiteboard or similar. The problem with this method is that student oftentimes struggle to keep up with the teacher's pace - he is an experienced programmer who can grasp the concept at hand very quickly. Students on the other hand require time to go through everything that is said. However their attention is preoccupied with copying code off the whiteboard, code they can receive by email for example. We offer a solution to this problem by bringing every student's and the teacher's environment in a shared place that can be view by anyone at any time.
 
## Features
* View another user's terminal session - you can click on the avatar of every user and see what they are doing *in real time*.
* User file isolation - every user gets a clean environment, separate form everyone else.
* User communication - users can send files between each other for fast sharing of work.
* Permissioning system between users - anyone can request permission to write in your terminal session. A great way to keep progressing when one member of the group feel stuck.
* Full freedom of each and every user - the frustration with not having permission to install packages is gone! Every user's is free to do whatever they like.
 
## Intended audience
This project is designed for introductory computer science classes. This is not to say it is not suitable for other applications. The intent is to help a teacher in his teaching.
 
This project is not meant to be used over the internet. We recommend that all connected users be present in the same room, or at least with the ability to communicate face-to-face. Some of the features we include make this product extremely insecure in the context of a WAN.
 
## Techincal implementation
Upon connecting every user gets an overlayFS of the whole system. We launch a terminal session and `chroot` it into this partition.
 
## Running
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
 
## Notes
The app uses `chroot` and `mount` for user isolation and because of this needs to be ran with superuser privileges. It would be advised to use a virtual machine at this stage in the project.
 
## Dependencies
* [Terminado](https://github.com/jupyter/terminado) - The xterm backend. Forwards the console to a websocket.
* [XTerm.js](https://github.com/xtermjs/xterm.js) - Terminal emulator in the browser.
 
## System requirements
Tested on:
 
* Python 3.6
* node v8.9
* npm v5.7
 
## Contributors
* [Loosper](https://github.com/loosper) - backend
* [denishristov](https://github.com/denishristov) - frontend
 
## Trivia
This is a course project for Software engineering class. It was build with its constraints and deadlines in mind.
 
## License
This project is licensed under the GPLv2.0
