import tornado.web
# This demo requires tornado_xstatic and XStatic-term.js
import tornado_xstatic
import os
import webbrowser

from terminado import TermSocket, NamedTermManager
from terminado import uimodule


STATIC_DIR = os.path.join(os.path.dirname(__file__), "../client")
TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "../client")


class TerminalPageHandler(tornado.web.RequestHandler):
    def get(self, path):
        return self.render(
            "index.html", static=self.static_url,
            xstatic=self.application.settings['xstatic_url'],
            ws_url_path="/websocket/" + path
        )


def main(argv):
    term_manager = NamedTermManager(3, shell_command=['zsh'])
    handlers = [
        (r"/websocket/(.*)", TermSocket, {'term_manager': term_manager}),
        (r"/(.*)", TerminalPageHandler),
        (r"/xstatic/(.*)", tornado_xstatic.XStaticFileHandler,
            {'allowed_modules': ['termjs']})
    ]
    app = tornado.web.Application(
        handlers, static_path=STATIC_DIR,
        template_path=TEMPLATE_DIR,
        ui_modules={'Terminal': uimodule.Terminal},
        xstatic_url=tornado_xstatic.url_maker('/xstatic/')
    )

    PORT = 8765
    print('Listening on port {}.'.format(PORT))

    app.listen(8765, 'localhost')
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
