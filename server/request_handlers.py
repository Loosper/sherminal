import json


from tornado.web import RequestHandler
from terminado import TermSocket
from database import User


# REVIEW: dir() and help()
# TODO: spin off into threads
class DatabaseQuery:
    async def search_username(self, username):
        return self.session.query(User).filter_by(username=username).first()

    async def add(self, *args):
        self.session.add(*args)
        self.session.commit()


class LoginManager(RequestHandler, DatabaseQuery):
    def initialize(self, database):
        self.session = database()

    def options(self):
        # TODO: figure out how to properly deploy
        self.set_header('Access-Control-Allow-Origin', '*')
        self.set_header('Access-Control-Allow-Headers', 'Content-type')

    # TODO: await databse connections
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


class UserTermManager(TermSocket, DatabaseQuery):
    def initialize(self, term_manager, database):
        self.session = database()
        super().initialize(term_manager)

    async def open(self, url_component=None):
        user = await self.search_username(url_component)

        if not user:
            self.close(401, 'Not created')
            return

        print(url_component)
        super().open(url_component)

    # we serve the client from a different place
    def check_origin(self, origin):
        return True
