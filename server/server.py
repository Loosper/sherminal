import json
import os
# import webbrowser
# import asyncio
import tornado.web
import tornado.options

from tornado.web import StaticFileHandler, RequestHandler
from tornado.platform.asyncio import AsyncIOMainLoop

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from terminado import TermSocket, NamedTermManager


from database import Base, User

DIR = os.path.dirname(__file__)


# class TerminalPageHandler(tornado.web.RequestHandler):
#     async def get(self, path):
#         return self.render(
#             "index.html", static=self.static_url,
#             ws_url_path="/websocket/" + path
#         )


# REVIEW: dir() and help()
class Static(StaticFileHandler):
    def initialize(self, path):
        self.dirname, self.filename = os.path.split(path)
        super().initialize(self.dirname)

    def get(self, path=None, include_body=True):
        super().get(self.filename, include_body)


# TODO: spin off into threads
class DatabseQuery:
    async def search_username(self, username):
        return self.session.query(User).filter_by(username=username).first()

    async def add(self, *args):
        self.session.add(*args)
        self.session.commit()


class Login(RequestHandler, DatabseQuery):
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


class UserTermManager(TermSocket, DatabseQuery):
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


def main(argv):
    AsyncIOMainLoop().install()
    # logging
    tornado.options.parse_command_line()

    engine = create_engine('sqlite:///:memory:', echo=True)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)

    term_manager = NamedTermManager(3, shell_command=['zsh'])
    handlers = [
        (r"/websocket/(.*)", UserTermManager, {
            'term_manager': term_manager, 'database': Session
        }),
        (r"/", Static,
            {'path': os.path.join(DIR, "../client/index.html")}),
        (r'/login', Login, {'database': Session}),
        (r'/static/(setup\.js)', StaticFileHandler,
            {'path': os.path.join(DIR, "../client/")}),
        (r'/static/(.*)', StaticFileHandler,
            {'path': os.path.join(DIR, "../node_modules/xterm/dist")})
    ]

    app = tornado.web.Application(
        handlers,
        debug=True
    )

    PORT = 8765
    print('Listening on port {}.'.format(PORT))

    app.listen(PORT, 'localhost')

    loop = tornado.ioloop.IOLoop.instance()
    # loop.add_callback(webbrowser.open, "http://localhost:{}/".format(PORT))

    try:
        loop.start()
    except KeyboardInterrupt:
        print(" Shutting down...")
    finally:
        term_manager.shutdown()
        loop.close()


if __name__ == '__main__':
    main([])