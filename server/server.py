import os
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
PORT = 8765


AsyncIOMainLoop().install()
# logging
tornado.options.parse_command_line()

engine = create_engine('sqlite:///:memory:', echo=True)
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

term_manager = NamedTermManager(3, shell_command=['zsh'])

handlers = [
    (r"/websocket/(.*)", UserTermManager, {
        'term_manager': term_manager, 'session': Session
    }),
    (r'/login', LoginManager, {'session': Session})
]

app = tornado.web.Application(
    handlers,
    debug=True
)

print('Listening on port {}.\nPress Ctrl + C to stop.'.format(PORT))

app.listen(PORT)

loop = tornado.ioloop.IOLoop.instance()

try:
    loop.start()
except KeyboardInterrupt:
    print(" Shutting down...")
finally:
    term_manager.shutdown()
    loop.close()
    engine.dispose()
