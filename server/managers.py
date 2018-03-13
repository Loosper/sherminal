from terminado import NamedTermManager
from terminado.management import MaxTerminalsReached

import subprocess
import os


class ChrootNamedTermManager(NamedTermManager):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # TODO: export to config
        self.data_path = '/tmp/users/'
        if not os.path.isdir(self.data_path):
            os.mkdir(self.data_path)

    def get_terminal(self, term_name):
        assert term_name is not None

        if term_name in self.terminals:
            return self.terminals[term_name]

        if self.max_terminals and len(self.terminals) >= self.max_terminals:
            raise MaxTerminalsReached(self.max_terminals)

        user_path = self.data_path + term_name
        data = user_path + '_data'
        work = user_path + '_work'
        if not os.path.isdir(user_path):
            os.mkdir(user_path)
            os.mkdir(data)
            os.mkdir(work)

        if not os.path.ismount(user_path):
            subprocess.run(
                # why is this twice
                f'mount -t overlay overlay -o\
                lowerdir=/,upperdir={data},workdir={work} {user_path}',
                shell=True
            )

        self.shell_command[1] = user_path

        # Create new terminalNamedTermManager
        self.log.info("New terminal with specified name: %s", term_name)
        term = self.new_terminal()
        term.term_name = term_name
        self.terminals[term_name] = term
        self.start_reading(term)
        return term

    def on_eof(self, pty):
        subprocess.run(
            f'umount {self.data_path}{pty.term_name}',
            shell=True
        )
        super().on_eof(pty)
