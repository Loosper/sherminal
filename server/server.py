import os
# import webbrowser
# import asyncio
import tornado.web
import tornado.options

from tornado.platform.asyncio import AsyncIOMainLoop

from terminado import NamedTermManager

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database import Base
from request_handlers import UserTermManager, LoginManager


DIR = os.path.dirname(__file__)


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
        (r'/login', LoginManager, {'database': Session})
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
