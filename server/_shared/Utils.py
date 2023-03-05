import requests
from server._shared.Config import Config
from pathlib import Path

class Utils:
    def __init__(self):
        self.config = Config()


    def get_two_char_int_string(self, n):
        if(n < 10):
            return f'0{str(n)}'
        else:
            return str(n)


    def save_thumbnail(self, img_url, filename, folderpath):
        # download image
        img_data = requests.get(img_url).content

        # get file name info
        # filepath = f'{self.config.ARCHIVE_FOLDER}/{website_name}/thumbnails/{year}/{month}'
        # filename = f'{self.config.url_to_filename(webpage_url)}_thumbnail'
        # file_extension = img_url.split('.')[-1]

        # clean up folder path
        if folderpath[-1] == '/':
            folderpath = folderpath[:-1]

        # make sure folder path exists
        Path(folderpath).mkdir(parents=True, exist_ok=True)

        # and write to disk
        with open(f'{folderpath}/{filename}', 'wb') as f:
            f.write(img_data)


if __name__ == '__main__':
    img_url = 'https://www.gamespot.com/a/uploads/screen_petite/1440/14409144/2230806-default-art--screen.jpg'
    filename = ''
    
    config = Config()
    filepath = f'{config.ARCHIVE_FOLDER}/GameSpot/_thumbnails/2000/02'
    filename = f'17_john-romero-loses-daikatana_1100-2440247_thumbnail.jpg'

    utils = Utils()
    utils.save_thumbnail(img_url, filename, filepath)