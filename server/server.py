import os
# import asyncio
import tornado.web
import tornado.options

from tornado.platform.asyncio import AsyncIOMainLoop

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base
from request_handlers import UserTermHandler, LoginHandler, ActiveUsersHandler
from managers import ChrootNamedTermManager


DIR = os.path.dirname(__file__)
PORT = 8765
HOST = 'localhost'

AsyncIOMainLoop().install()

# logging
tornado.options.parse_command_line()

engine = create_engine(
    'sqlite:///:memory:',
    connect_args={'check_same_thread': False},
    poolclass=StaticPool,
    echo=False
)
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

# TODO: set absolute maximum and refuse everything after
term_manager = ChrootNamedTermManager(15, shell_command=['chroot', ''])

handlers = [
    (r"/websocket/(.*)/?", UserTermHandler, {
        'term_manager': term_manager, 'session': Session
    }),
    (r'/login/?', LoginHandler, {'session': Session}),
    (r'/active_users/?', ActiveUsersHandler)
]

app = tornado.web.Application(
    handlers,
    debug=True
)

print('Listening on port {}.\nPress Ctrl^C to stop.'.format(PORT))

app.listen(PORT, HOST)

loop = tornado.ioloop.IOLoop.instance()

try:
    loop.start()
except KeyboardInterrupt:
    print("Shutting down...")
finally:
    term_manager.shutdown()
    loop.close()
    engine.dispose()
