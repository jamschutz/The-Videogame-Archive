import pathlib
from bs4 import BeautifulSoup
import requests, json, time, random
from Core.Config import Config
from Core.DbManager import DbManager
from Core.Utils import Utils
from Core.AzureStorageManager import AzureStorageManager


class ArchiverEurogamer:

    def __init__(self):
        self.website_name = 'Eurogamer'
        self.db_manager = DbManager()
        self.config = Config()
        self.utils = Utils()
        self.az_storage_manager = AzureStorageManager()
        self.BATCH_SIZE = 500

        self.SUBTITLE_DIV_CLASS = 'synopsis'
        self.AUTHOR_DIV_CLASS = 'author'
        self.ARTICLE_TYPE_DIV_CLASS = 'article_type'
        self.THUMBNAIL_CLASS = 'headline_image'


        # initialize helpers
        self.config = Config()
        self.db_manager = DbManager()
        self.utils = Utils()

        self.ARTICLES_THAT_FAILED_TO_PARSE = []


    def get_thumbnail_url(self, soup):
        thumbnail_url = soup.find('img', class_=self.THUMBNAIL_CLASS)

        # if no image, return Eurogamer's placeholder
        if(thumbnail_url == None):
            return 'https://www.eurogamer.net/static/img/placeholder.png'

        # otherwise, we want to turn something like this:
        #               https://img.jpg/resize/690%3E/format/jpg/img.jpg
        # into this:    https://img.jpg/thumbnail/384x216/format/jpg/img.jpg
        # e.g.: replace '/resize/690%30E/' with '/thumbnail/384x216/'
        thumbnail_url = thumbnail_url['src']
        split_index = thumbnail_url.find('/resize/690%3E/')

        url_part1 = thumbnail_url[:split_index]
        url_part2 = thumbnail_url[split_index + len('/resize/690%30E/') - 1:]

        return f'{url_part1}/thumbnail/384x216/{url_part2}'



    def get_article_data(self, article, raw_html):
        # parse html
        soup = BeautifulSoup(raw_html, 'lxml')

        try:
            # add info we need
            # not all articles have subtitles...
            article['subtitle'] = soup.find('section', class_=self.SUBTITLE_DIV_CLASS)
            if article['subtitle'] == None:
                article['subtitle'] = ''
            else:
                article['subtitle'] = article['subtitle'].text.strip()

            article['author'] = soup.find('span', class_=self.AUTHOR_DIV_CLASS).a.text.strip()
            article['type'] = soup.find('span', class_=self.ARTICLE_TYPE_DIV_CLASS).text.strip().lower()
            article['thumbnail_url'] = self.get_thumbnail_url(soup)

            return article

        except Exception as e:
            print(f'ERROR parsing: {article["title"]}: {str(e)}')
            if article['url'] not in self.ARTICLES_THAT_FAILED_TO_PARSE:
                self.ARTICLES_THAT_FAILED_TO_PARSE.append(article['url'])
            return None


        
    def send_thumbnail_to_archive(self, article):
        date_published = str(article['date'])
        year = date_published[:4]
        month = date_published[4:6]

        filename = self.utils.get_thumbnail_filename(article, self.config.website_id_lookup[self.website_name])
        folder_path = f'{self.website_name}/_thumbnails/{year}/{month}'

        # download image
        img_data = requests.get(article['thumbnail_url']).content

        # clean up folder path
        if folder_path[-1] == '/':
            folder_path = folder_path[:-1]

        self.az_storage_manager.save_to_archive(img_data, folder_path, filename, f'image/{self.utils.get_thumbnail_extension(article['thumbnail_url'])}')



    def send_article_to_archive(self, article, raw_html):
        # reset articles failed to parse
        ARTICLES_THAT_FAILED_TO_PARSE = []

        # parse the bits we need (for folder / filename)
        url = article['url']
        date_published = str(article['date'])
        year = date_published[:4]
        month = date_published[4:6]
        day = date_published[6:]

        # set target folder and filename
        folder_path = f'{self.website_name}/{year}/{month}'
        filename = self.config.url_to_filename(url, day, self.website_name)

        # save webpage
        self.az_storage_manager.save_to_archive(raw_html, folder_path, filename, 'text/html')

        # and also save the thumbnail
        self.send_thumbnail_to_archive(article)



    def archive_queued_urls(self, num_urls_to_archive, counter_offset=0, actual_max=-1):
        actual_max = num_urls_to_archive if actual_max < 0 else actual_max
        # get articles to archive
        website_id = self.config.website_id_lookup[self.website_name]
        articles_to_archive = self.db_manager.get_urls_to_archive(num_urls_to_archive, website_id)

        print(articles_to_archive)

        # and archive each one
        counter = 1
        for article in articles_to_archive:
            print(f'saving article {article["title"]} ({article["date"]})....[{counter + counter_offset}/{actual_max}]')
            
            # download webpage
            raw_html = requests.get(article['url']).text

            # get article data
            article = self.get_article_data(article, raw_html)
            
            # if None, something went wrong, just skip
            if article != None:
                # save to filepath
                self.send_article_to_archive(article, raw_html)
                # and update its info in the DB
                # db_manager.update_article(article)

            # don't spam
            time.sleep(random.uniform(0.7, 1.6))
            counter += 1

        # # get list of articles that were succesfully archived
        # articles_archived_successfully = []
        # for article in articles_to_archive:
        #     if article['url'] not in ARTICLES_THAT_FAILED_TO_PARSE:
        #         articles_archived_successfully.append(article)
        
        # # and mark as archived in the db
        # db_manager.mark_articles_as_archived(articles_archived_successfully)
        # print(f'*********************failed to parse the following articles: {",".join(ARTICLES_THAT_FAILED_TO_PARSE)}')


    def archive_all_urls():
        counter = 0
        while counter < self.MAX_WEBSITES_TO_ARCHIVE:
            archive_queued_urls(self.BATCH_SIZE, counter, self.MAX_WEBSITES_TO_ARCHIVE)
            counter += self.BATCH_SIZE
        print('done')



if __name__ == '__main__':
    archiver = ArchiverEurogamer()
    archiver.archive_queued_urls(10, 0, 10)