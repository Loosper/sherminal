#! /user/bin/env python3

import os
# import asyncio
import tornado.web
import tornado.options

from tornado.platform.asyncio import AsyncIOMainLoop

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, User
from request_handlers import UserTermHandler, LoginHandler, FileSendHandler
from managers import ChrootNamedTermManager


DIR = os.path.dirname(__file__)
PORT = 8765
HOST = '0.0.0.0'
CHROOT_DIR = '/tmp/users/'

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

# add amin
session = Session()
session.add(User(
    username='loosper',
    password='hello',
    guid='super_secret',
    administrator=True,
    avatar='https://api.adorable.io/avatars/123'
))
session.add(
    User(
        username='terminator',
        password='da',
        guid='vlizamvkodada',
        administrator=True,
        avatar="https://www.sideshowtoy.com/photo.php?sku=902662"
    )
)
session.commit()

# TODO: set absolute maximum and refuse everything after
term_manager = ChrootNamedTermManager(
    50, shell_command=['chroot', '', '/bin/bash'], root_dir=CHROOT_DIR
)

handlers = [
    # socket/identificator
    (r"/websocket/(.*)/(.*)/?", UserTermHandler, {
        'term_manager': term_manager,
        'session': Session,
        'chroot_dir': CHROOT_DIR
    }),
    (r'/login/?', LoginHandler, {'session': Session}),
    (r'/send/?', FileSendHandler, {'chroot_dir': CHROOT_DIR})
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
