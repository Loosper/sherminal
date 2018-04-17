import json
import asyncio
import logging
import re
import uuid

from tornado.web import RequestHandler, asynchronous
from tornado.iostream import StreamClosedError
from terminado import TermSocket
from functools import partial

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
                guid=uuid.uuid1().hex
            )
            await self.add(user)

        if user is False or user.administrator and password is None:
            self.send_error(401)
            return

        response_data = {
            'terminal_path': data['username'],
            'auth_token': user.guid,
            'administrator': user.administrator
        }
        self.write(response_data)


class ActiveUsersTracker:
    ''' Track users who have an open termianl'''
    def __init__(self):
        # TODO: this should be something fast
        self.users = set()
        self.registered_handlers = []

    def add_user(self, user):
        if user not in self.users:
            self.users.add(user)

            # notify all registered
            for handler in self.registered_handlers:
                handler('added', user)

    def remove_user(self, user):
        self.users.discard(user)

        # notify all registered
        for handler in self.registered_handlers:
            handler('removed', user)

    def register(self, handler):
        self.registered_handlers.append(handler)
        # print(len(self.registered_handlers))

    def deregister(self, callback):
        self.registered_handlers.remove(callback)

    def get_users(self):
        return self.users


default_tracker = ActiveUsersTracker()


class UserTermHandler(TermSocket, DatabaseQuery):
    def initialize(self, session, term_manager, tracker=default_tracker):
        self.setup_session(session)
        self.tracker = tracker
        self.userURL = ''
        self.read_only = False

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

        if host != guest and not guest.administrator:
            # print('non-user: ', guest)
            self.read_only = True

        # TODO: consider having a seperate term handler for superuser sessions
        # REVIEW: this can fail when threshold reached.
        # a) increase maximum
        # b) ruturn error
        super().open(host_id)

        # add user to logged in list
        self.userURL = conn_url
        self.tracker.add_user(host_id)

    def on_message(self, message):
        if self.read_only:
            return
        else:
            super().on_message(message)

    def on_close(self):
        self.tracker.remove_user(self.userURL)
        super().on_close()

    # we serve the client from a different place
    def check_origin(self, origin):
        return True


class ActiveUsersHandler(RequestHandler):
    def initialize(self, tracker=default_tracker):
        self.tracker = tracker
        self.loop = asyncio.get_event_loop()

        # hax
        self.set_header(
            'Access-Control-Allow-Origin',
            self.request.headers.get('Origin')
        )
        self.set_header('Content-Type', 'text/event-stream')
        self.set_header('Cache-Control', 'no-cache')

    # NOTE: if you make this async this breaks
    @asynchronous
    def get(self):
        users = self.tracker.get_users()
        if users:
            self.write(f'data: {json.dumps(list(users))}\n\n')

        Logger.info(self.request.uri + ' Opened')

        self.tracker.register(self.send_message)
        self.keep_alive()

    def on_connection_close(self):
        Logger.info(self.request.uri + ' Closed')
        self.tracker.deregister(self.send_message)
        self.refresher.cancel()

    def keep_alive(self):
        # void message to refresh connection
        self.write(': keep_alive\n\n')
        self.flush()
        self.refresher = self.loop.call_later(15, self.keep_alive)

    def send_message(self, msg_type, msg_value):
        try:
            self.write(f'event: {msg_type}\ndata: {msg_value}\n\n')
            self.flush()
        except StreamClosedError as error:
            raise
