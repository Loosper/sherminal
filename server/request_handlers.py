import os
import json


from tornado.web import StaticFileHandler, RequestHandler
from terminado import TermSocket
from database import User


# class TerminalPageHandler(tornado.web.RequestHandler):
#     async def get(self, path):
#         return self.render(
#             "index.html", static=self.static_url,
#             ws_url_path="/websocket/" + path
#         )


# REVIEW: dir() and help()
class StaticManager(StaticFileHandler):
    def initialize(self, path):
        self.dirname, self.filename = os.path.split(path)
        super().initialize(self.dirname)

    def get(self, path=None, include_body=True):
        super().get(self.filename, include_body)


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
