import tornado.web
# This demo requires tornado_xstatic and XStatic-term.js
import tornado_xstatic
import os
import webbrowser

from terminado import TermSocket, SingleTermManager
from terminado import uimodule


STATIC_DIR = os.path.join(os.path.dirname(__file__), "../client")
TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "../client")


def run_and_show_browser(url, term_manager):
    loop = tornado.ioloop.IOLoop.instance()
    loop.add_callback(webbrowser.open, url)
    try:
        loop.start()
    except KeyboardInterrupt:
        print(" Shutting down...")
    finally:
        term_manager.shutdown()
        loop.close()


class TerminalPageHandler(tornado.web.RequestHandler):
    def get(self):
        return self.render("index.html", static=self.static_url,
                           xstatic=self.application.settings['xstatic_url'],
                           ws_url_path="/websocket")


def main(argv):
    term_manager = SingleTermManager(shell_command=['bash'])
    handlers = [
        (r"/websocket", TermSocket, {'term_manager': term_manager}),
        (r"/", TerminalPageHandler),
        (r"/xstatic/(.*)", tornado_xstatic.XStaticFileHandler,
            {'allowed_modules': ['termjs']})
    ]
    app = tornado.web.Application(
        handlers, static_path=STATIC_DIR,
        template_path=TEMPLATE_DIR,
        ui_modules={'Terminal': uimodule.Terminal},
        xstatic_url=tornado_xstatic.url_maker('/xstatic/')
    )

    app.listen(8765, 'localhost')
    run_and_show_browser("http://localhost:8765/", term_manager)


if __name__ == '__main__':
    main([])
