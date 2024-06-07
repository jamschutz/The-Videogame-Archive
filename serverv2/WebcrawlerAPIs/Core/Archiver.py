from Core.Config import Config
from Core.Utils import Utils
from Core.AzureStorageManager import AzureStorageManager

import logging, requests, pathlib


class Archiver:
    def __init__(self):
        self.config = Config()
        self.utils = Utils()
        self.az_storage_manager = AzureStorageManager()



    def send_thumbnail_to_archive(self, article, website_name):
        if website_name == None or website_name == '':
            print('NOT GOING TO ARCHIVE BECAUSE WEBSITE NAME NOT SET!!!')
            logging.info('NOT GOING TO ARCHIVE BECAUSE WEBSITE NAME NOT SET!!!')

        date_published = str(article.date)
        year = date_published[:4]
        month = date_published[4:6]

        filename = self.utils.get_thumbnail_filename(article)
        folder_path = f'{website_name}/_thumbnails/{year}/{month}'

        # download image
        img_data = requests.get(article.thumbnail_url).content

        # clean up folder path
        if folder_path[-1] == '/':
            folder_path = folder_path[:-1]

        # make sure folder path exists
        pathlib.Path(f'{self.config.ARCHIVE_FOLDER}/{folder_path}').mkdir(parents=True, exist_ok=True)

        with open(f'{self.config.ARCHIVE_FOLDER}/{folder_path}/{filename}.{self.utils.get_thumbnail_extension(article.thumbnail_url)}', "wb") as f:
            f.write(img_data)

        # self.az_storage_manager.save_to_archive(img_data, folder_path, filename, f"image/{self.utils.get_thumbnail_extension(article.thumbnail_url)}")



    def send_article_to_archive(self, article, raw_html, website_name):
        if website_name == None or website_name == '':
            print('NOT GOING TO ARCHIVE BECAUSE WEBSITE NAME NOT SET!!!')
            logging.info('NOT GOING TO ARCHIVE BECAUSE WEBSITE NAME NOT SET!!!')

        # parse the bits we need (for folder / filename)
        url = article.url
        date_published = str(article.date)
        year = date_published[:4]
        month = date_published[4:6]
        day = date_published[6:]

        # set target folder and filename
        folder_path = f'{website_name}/{year}/{month}'
        filename = self.config.url_to_filename(url, day, website_name)

        # make sure folder path exists
        pathlib.Path(f'{self.config.ARCHIVE_FOLDER}/{folder_path}').mkdir(parents=True, exist_ok=True)

        # save webpage
        # self.az_storage_manager.save_to_archive(raw_html, folder_path, filename, 'text/html')
        with open(f'{self.config.ARCHIVE_FOLDER}/{folder_path}/{filename}.html', "w", encoding="utf-8") as html_file:
            html_file.write(raw_html)

        # and also save the thumbnail
        self.send_thumbnail_to_archive(article, website_name)