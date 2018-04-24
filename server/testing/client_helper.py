from tornado.websocket import websocket_connect

import tornado
import requests
import json
# import asyncio

HOST = 'localhost:8765/'


# this is not a testing suite. However i need to automate the testing process
# of this whole this, so here we are
class Tester:
    def __init__(self):
        response = requests.post(
            'http://' + HOST + 'login', json={'username': 'test'}
        )
        self.login_info = response.json()
        self.conn = websocket_connect(
            'ws://' + HOST +
            'websocket/' + self.login_info['terminal_path'] +
            '/' + self.login_info['auth_token']
        )

        self.loop = tornado.ioloop.IOLoop.instance()

    async def listen_websocket(self):
        self.conn = await self.conn

        # self.loop.add_callback(self.send_message, ['', ''])

        while True:
            msg = await self.conn.read_message()
            if msg is None:
                break

            print(msg)

    async def send_message(self, message):
        self.conn.write_message(json.dumps(message))

    def run(self):
        self.loop.add_callback(self.listen_websocket)

        try:
            self.loop.start()
        except KeyboardInterrupt:
            print("Shutting down...")
        finally:
            self.loop.close()


tester = Tester()
tester.run()
