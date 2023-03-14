from enum import Enum
from url_normalize import url_normalize
import requests, pathlib, json, os

from .WaybackDbManager import WaybackDbManager
from .._shared.Config import Config
from .._shared.Utils import Utils


class WaybackUrlManager:
    def __init__(self):
        self.config = Config()
        self.db = WaybackDbManager()
        self.utils = Utils()


    def save_unique_urls(self, website):
        batch_size = 10000
        offset = 0
        total_count = 5622695
        num_batches = int(total_count / batch_size)
        counter = 1

        while offset < total_count:
            print(f'getting batch {counter} of {num_batches}...')
            urls = self.db.get_urls_for_website(website, offset, batch_size)

            output = ""
            for url in urls:
                tab_indent = "\t\t\t" if url[0] < 1000 else "\t\t"
                output += f'{url[0]}{tab_indent}{url[1]}\n'
            
            folderpath = f'{self.config.WAYBACK_MACHINE_DUMP_FOLDER}/{website}/urls'
            
            # make sure folder path exists
            pathlib.Path(folderpath).mkdir(parents=True, exist_ok=True)
            
            print('and saving...')
            # and save
            with open(f'{folderpath}/{str(counter)}.txt', "w") as text_file:
                text_file.write(output)

            counter += 1
            offset += batch_size


if __name__ == '__main__':
    wayback = WaybackUrlManager()
    wayback.save_unique_urls('GameSpot')

    # test_url = 'www.ign.com'
    # wayback = WaybackManager()
    # wayback.save_list_of_urls('www.ign.com', 'IGN')