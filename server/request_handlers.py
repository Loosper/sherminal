import json
import asyncio

from tornado.web import RequestHandler
from terminado import TermSocket
from functools import partial

from database import User

from concurrent.futures import ThreadPoolExecutor


Executor = ThreadPoolExecutor(max_workers=5)


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

    async def search_username(self, username):
        def query(name):
            return self.session.query(User).filter_by(username=name).first()

        return await self.loop.run_in_executor(
            Executor, partial(query, username)
        )

    async def add(self, *args):
        def adder(*args):
            self.session.add(*args)
            self.session.commit()

        return await self.loop.run_in_executor(
            Executor, partial(adder, *args)
        )

    def on_finish(self):
        self.session.close()


class LoginHandler(RequestHandler, DatabaseQuery):
    def initialize(self, session):
        self.setup_session(session)

    def options(self):
        # TODO: figure out how to properly deploy
        self.set_header('Access-Control-Allow-Origin', '*')
        self.set_header('Access-Control-Allow-Headers', 'Content-type')

    async def post(self):
        if self.request.headers["Content-Type"].startswith("application/json"):
            try:
                data = json.loads(self.request.body)
            except json.JSONDecodeError:
                self.send_error(400)
                return
        else:
            return

        self.set_header('Access-Control-Allow-Origin', '*')

        user = await self.search_username(data['username'])

        if not user:
            new_user = User(username=data['username'])
            await self.add(new_user)

        self.write({'terminal_path': data['username']})


class UserTermHandler(TermSocket, DatabaseQuery):
    def initialize(self, session, term_manager):
        self.setup_session(session)
        self.read_only = False
        super().initialize(term_manager)

    async def open(self, url_component=None):
        user = await self.search_username(url_component)

        if not user:
            self.close(401, 'Not created')
            return

        super().open(url_component)

    def on_message(self, message):
        if self.read_only:
            return
        else:
            super().on_message(message)

    # we serve the client from a different place
    def check_origin(self, origin):
        return True


class ActiveUsersHandler(RequestHandler):
    def initialize(self, term_manager):
        self.manager = term_manager

    def get(self):
        self.set_header('Access-Control-Allow-Origin', '*')

        self.write({'active_users': list(self.manager.terminals.keys())})
