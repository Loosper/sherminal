import tornado.web
import os
import webbrowser
# import asyncio
import tornado.options

from tornado.web import StaticFileHandler
from tornado.platform.asyncio import AsyncIOMainLoop

# from sqlalchemy import create_engine

from terminado import TermSocket, NamedTermManager


DIR = os.path.dirname(__file__)


class TerminalPageHandler(tornado.web.RequestHandler):
    async def get(self, path):
        return self.render(
            "index.html", static=self.static_url,
            ws_url_path="/websocket/" + path
        )


class Static(tornado.web.StaticFileHandler):
    def initialize(self, path):
        self.dirname, self.filename = os.path.split(path)
        super().initialize(self.dirname)

    def get(self, path=None, include_body=True):
        super().get(self.filename, include_body)


def main(argv):
    AsyncIOMainLoop().install()
    # logging
    tornado.options.parse_command_line()

    # engine = create_engine('sqlite:///:memory:', echo=True)

    term_manager = NamedTermManager(3, shell_command=['zsh'])
    handlers = [
        (r"/websocket/(.*)", TermSocket, {'term_manager': term_manager}),
        (r"/", Static,
            {'path': os.path.join(DIR, "../client/index.html")}),
        (r'/static/(setup\.js)', StaticFileHandler,
            {'path': os.path.join(DIR, "../client/")}),
        (r'/static/(.*)', StaticFileHandler,
            {'path': os.path.join(DIR, "../node_modules/xterm/dist")})
    ]

    app = tornado.web.Application(
        handlers
    )

    PORT = 8765
    print('Listening on port {}.'.format(PORT))

    app.listen(PORT, 'localhost')

    loop = tornado.ioloop.IOLoop.instance()
    loop.add_callback(webbrowser.open, "http://localhost:{}/".format(PORT))

    try:
        loop.start()
    except KeyboardInterrupt:
        print(" Shutting down...")
    finally:
        term_manager.shutdown()
        loop.close()


if __name__ == '__main__':
    main([])
