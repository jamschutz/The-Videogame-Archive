from .Config import Config
from pathlib import Path

class FileManager:
    def __init__(self):
        self.config = Config()


    def save_to_disk(self, data, folderpath, filename):
        # make sure folder path exists
        Path(folderpath).mkdir(parents=True, exist_ok=True)

        # and write to disk
        with open(f'{self.config.ARCHIVE_FOLDER}/{folderpath}/{filename}', 'wb') as f:
            f.write(data)