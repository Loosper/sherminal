#! /usr/bin/env python3

import os
import sys
import requests

SERVER_PORT = 8765


if len(sys.argv) < 3:
    print('Usage: send path_to_file to_whom')
    sys.exit()

file_path = os.path.abspath(sys.argv[1])
if not os.path.exists(file_path):
    print('Wrong file path: ' + sys.argv[1])
    sys.exit()

response = requests.post(f'http://localhost:{SERVER_PORT}/send', json={
    # the current user is stored here
    'from': os.environ['LOGGED_IN_USER'],
    'to': sys.argv[2],
    'file': file_path
})

if response.status_code == 200:
    print('Sent a notification.')
elif response.status_code == 403:
    print(f'No such user: {sys.argv[2]}')
elif response.status_code == 404:
    print(f'Wrong file path: {sys.argv[1]} (404)')
