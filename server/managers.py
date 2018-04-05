from terminado import NamedTermManager

import subprocess
import os


# TODO:?Create a wrapper that encapsulates the terminado objects with auxiliary
# metadata like term: chroot_dir pairs
class ChrootNamedTermManager(NamedTermManager):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # TODO: export to config
        self.data_path = '/tmp/users/'
        if not os.path.isdir(self.data_path):
            os.makedirs(self.data_path)

    def get_terminal(self, term_name):
        self.term_name = term_name
        return super().get_terminal(term_name)

    def new_terminal(self, **kwargs):
        user_path = self.data_path + self.term_name
        data = user_path + '_data'
        work = user_path + '_work'
        if not os.path.isdir(user_path):
            os.mkdir(user_path)
            os.mkdir(data)
            os.mkdir(work)
            # TODO: put path of user in db

        if not os.path.ismount(user_path):
            subprocess.run(
                # why is this twice
                f'mount -t overlay overlay -o\
                lowerdir=/,upperdir={data},workdir={work} {user_path}',
                shell=True
            )

        self.shell_command[1] = user_path

        return super().new_terminal(**kwargs)

    def on_eof(self, pty):
        subprocess.run(
            f'umount {self.data_path}{pty.term_name}',
            shell=True
        )
        super().on_eof(pty)
