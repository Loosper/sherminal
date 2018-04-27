import json
import asyncio
import logging
import re
import uuid

from tornado.web import RequestHandler
from terminado import TermSocket
from functools import partial
from random import randint
# from asyncio import Future

from database import User

from concurrent.futures import ThreadPoolExecutor


Executor = ThreadPoolExecutor(max_workers=5)
Logger = logging.getLogger('tornado.access')


# REVIEW: dir() and help()
# TODO: spin off into threads
# Sessions are not thread-safe. However any database query is explicitly
# waited upon, so we don't need to worry about simultaneous accesss
# Effectively we do not speed up database access, we minimize downtime
# This assumption is false as soon as two requsts share a session
# (scoped_session) or a query is not wited upon
class DatabaseQuery:
    '''Library onbect for asynchronous database connection'''
    def setup_session(self, session):
        self.session = session()
        self.loop = asyncio.get_event_loop()

    async def query(self, args):  # that argument is a dict
        user = await self.loop.run_in_executor(
            Executor,
            lambda: self.session.query(User).filter_by(**args).first()
        )

        return user

    async def guid_to_user(self, guid):
        return await self.query({'guid': guid})

    async def name_to_user(self, username, password=None):
        # REVIEW: should waiting happen here?
        user = await self.query({'username': username})

        if user and password is not None and user.password != password:
            return False
        return user

    async def add(self, *args):
        def adder(*args):
            self.session.add(*args)
            self.session.commit()

        return await self.loop.run_in_executor(
            Executor, partial(adder, *args)
        )

    def on_finish(self):
        self.session.close()


# NOTE: this is also register, but there is no such mechanism
class LoginHandler(RequestHandler, DatabaseQuery):
    def initialize(self, session):
        self.setup_session(session)

    def prepare(self):
        self.set_header('Access-Control-Allow-Origin', '*')
        self.set_header(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept'
        )

    def options(self):
        # TODO: figure out how to properly deploy
        pass

    # TODO: Sanitize the name. It will be used in a FILESYSTEM PATH
    async def post(self):
        if self.request.headers["Content-Type"].startswith("application/json"):
            try:
                data = json.loads(self.request.body)
            except json.JSONDecodeError:
                self.send_error(400)
                return
        else:
            return

        self.set_header('Content-Type', 'application/json')

        # TODO: strip forbidden characters (&...)./
        username = re.escape(data['username'])
        password = data.get('password')

        # TODO: perhaps show error if password mismatch?
        user = await self.name_to_user(username, password)

        if user is None:
            user = User(
                username=username,
                password=password,
                administrator=False,
                guid=uuid.uuid1().hex,
                avatar='https://api.adorable.io/avatars/' +
                str(randint(0, 5000))
            )
            await self.add(user)

        if user is False or user.administrator and password is None:
            self.send_error(401)
            return

        response_data = {
            'terminal_path': data['username'],
            'auth_token': user.guid,
            'administrator': user.administrator,
            'avatar': user.avatar
        }
        self.write(response_data)

    def write_error(self, status_code):
        # why????
        self.set_header('Access-Control-Allow-Origin', '*')


class ActiveUsersTracker:
    ''' Track users who have an open termianl'''
    def __init__(self):
        # TODO: this should be something fast
        self.handlers = {}

    def notify_all(self, msg_type, message):
        for user, handler in self.handlers.items():
            handler[0].write_message(f'["{msg_type}", {message}]')

    def register(self, handler):
        # Logger.warning('registered: ' + handler.user.username)
        self.handlers[handler.user.username] = [handler]
        self.notify_all('add_user', handler.user.json())

    # REVIEW: this blows up sometimes
    def deregister(self, handler):
        del self.handlers[handler.user.username]
        self.notify_all('remove_user', handler.user.json())

    def register_guest(self, handler, host_name):
        # Logger.warning('guest with host: ' + host_name)
        self.handlers[host_name].append(handler)

    def deregister_guest(self, handler, host_name):
        self.handlers[host_name].remove(handler)

    def get_handlers(self):
        return [handlers[0] for key, handlers in self.handlers.items()]

    def get_handler(self, user):
        return self.handlers[user][0]

    def get_guest_handler(self, host, guest):
        print(self.handlers[host])
        for handler in self.handlers[host]:
            if handler.user.username == guest:
                return handler


default_tracker = ActiveUsersTracker()


class UserTermHandler(TermSocket, DatabaseQuery):
    def initialize(self, session, term_manager, tracker=default_tracker):
        self.setup_session(session)
        self.tracker = tracker
        self.user = ''
        self.read_only = False
        self.is_host = False
        self.owner = None
        # self.intialised = Future()

        super().initialize(term_manager)

    async def open(self, host_id, guest_id):
        conn_url = re.escape(host_id)
        # TODO: strip forbidden characters (&...)

        # TODO: this is where async will shine
        host = await self.name_to_user(conn_url)
        guest = await self.guid_to_user(guest_id)

        if not host or not guest:
            self.close(401, 'Not created')
            return

        self.user = guest
        # this means it's the owner, therefore his communication socket
        if host == guest:
            self.is_host = True
            self.tracker.register(self)
        else:
            self.owner = host
            # Logger.warning('guest')
            self.is_host = False
            self.tracker.register_guest(self, host.username)
            if not guest.administrator:
                self.read_only = True

        # REVIEW: this can fail when threshold reached.
        # a) increase maximum
        # b) ruturn error
        super().open(host_id)

    def send_users(self):
        users = self.tracker.get_handlers()
        self.write_message(
            '["initial_users", [' +
            ','.join([ws.user.json() for ws in users]) +
            ']]'
        )

    def on_message(self, message):
        if self.read_only:
            return
        else:
            data = json.loads(message)
            if data[0] == 'get_users':
                self.send_users()
            if data[0] == 'request_write':
                self.request_perm_write(data[1])
            if data[0] == 'allow_write':
                self.allow_write(data[1])
            if data[0] == 'deny_write':
                # TODO:
                # just send message to the other guy
                pass
            if data[0] == 'allow_file_write':
                self.allow_file_write(data[1])
            if data[0] == 'deny_file_write':
                pass
            super().on_message(message)

    def on_close(self):
        if self.is_host:
            self.tracker.deregister(self)
        else:
            self.tracker.deregister_guest(self, self.owner.username)
        super().on_close()

    # we serve the client from a different place
    def check_origin(self, origin):
        return True

    def request_perm_write(self, user):
        other = self.tracker.get_handler(user)
        other.write_message(f'["notification_write", {self.user.json()}]')

    def request_file_write(self, user, file_path):
        other = self.tracker.get_handler(user)
        data = self.user.json(extra={'file_path': file_path})
        other.write_message(f'["notification_file_write", {data}]')

    def allow_file_write(self, file_path):
        pass

    def allow_write(self, user):
        # Logger.warning('this just in: ' + user)
        other = self.tracker.get_guest_handler(self.user.username, user)
        other.read_only = False


class FileSendHandler(RequestHandler):
    def initialize(self, tracker=default_tracker):
        self.tracker = tracker

    def post(self):
        info = json.loads(self.request.body)
        try:
            print(info['from'])
            recipient = self.tracker.get_handler(info['from'])
        except KeyError:
            # wrong user
            self.send_error(403)
            return

        # TODO: check if file exists
        recipient.request_file_write(info['to'], info['file'])

    def write_error(self, code, **kwargs):
        if code == 500:
            self.write('I see you\'re screwing with my system. \nDon\'t.')
        else:
            super().write_error(code, **kwargs)
