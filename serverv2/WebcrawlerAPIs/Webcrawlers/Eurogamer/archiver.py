import pathlib
from bs4 import BeautifulSoup
import requests, json, time, random
from Core.Config import Config
from Core.DB.ArticlesManager import ArticlesManager
from Core.DB.WebsitesManager import WebsitesManager
from Core.Utils import Utils
from Core.AzureStorageManager import AzureStorageManager
from Core.Archiver import Archiver
from Core.SearchIndexer import SearchIndexer
from Entities.Article import Article


class ArchiverEurogamer:

    def __init__(self):
        self.website_name = 'Eurogamer'
        self.az_storage_manager = AzureStorageManager()
        self.archiver = Archiver()
        self.search_indexer = SearchIndexer()
        self.BATCH_SIZE = 500

        self.SUBTITLE_DIV_CLASS = 'synopsis'
        self.AUTHOR_DIV_CLASS = 'author'
        self.ARTICLE_TYPE_DIV_CLASS = 'article_type'
        self.THUMBNAIL_CLASS = 'headline_image'


        # initialize helpers
        self.config = Config()
        self.articles_manager = ArticlesManager()
        self.utils = Utils()
        self.website_id = WebsitesManager().get_id(self.website_name)

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
            article.subtitle = soup.find('section', class_=self.SUBTITLE_DIV_CLASS)
            if article.subtitle == None:
                article.subtitle = ''
            else:
                article.subtitle = article.subtitle.text.strip()

            article.author = soup.find('span', class_=self.AUTHOR_DIV_CLASS).a.text.strip()
            article.type = soup.find('span', class_=self.ARTICLE_TYPE_DIV_CLASS).text.strip().lower()
            article.thumbnail_url = self.get_thumbnail_url(soup)

            return article

        except Exception as e:
            print(f'ERROR parsing: {article.title}: {str(e)}')
            if article.url not in self.ARTICLES_THAT_FAILED_TO_PARSE:
                self.ARTICLES_THAT_FAILED_TO_PARSE.append(article.url)
            return None
        

    def get_article_content(self, raw_html):
        soup = BeautifulSoup(raw_html, 'lxml')
        paragraphs = soup.find('div', class_="article_body_content").find_all('p')

        content = ""
        for paragraph in paragraphs:
            content += f' {paragraph.text}'
        
        return content



    def archive_queued_urls(self, num_urls_to_archive, counter_offset=0, actual_max=-1):
        actual_max = num_urls_to_archive if actual_max < 0 else actual_max
        # get articles to archive
        articles_to_archive = self.articles_manager.get_articles_to_archive(num_urls_to_archive, self.website_id)

        # track articles that failed to parse
        articles_that_failed_to_parse = []

        # and archive each one
        counter = 1
        for article in articles_to_archive:
            print(f'saving article {article.title} ({article.date})....[{counter + counter_offset}/{actual_max}]')
            
            # download webpage
            raw_html = requests.get(article.url).text

            # get article data
            article = self.get_article_data(article, raw_html)
            content = self.get_article_content(raw_html)
            
            # if None, something went wrong, just skip
            if article != None:
                # save to filepath
                self.archiver.send_article_to_archive(article, raw_html, 'Eurogamer')
                self.archiver.send_thumbnail_to_archive(article, 'Eurogamer')
                self.search_indexer.index_article(content, article.id)

                # and update its info in the DB
                self.articles_manager.update_article(article, self.website_id)

            counter += 1

        # get list of articles that were succesfully archived
        articles_archived_successfully = []
        for article in articles_to_archive:
            if article is not None:
                articles_archived_successfully.append(article)
        
        # and mark as archived in the db
        self.articles_manager.mark_articles_as_archived(articles_archived_successfully)


    def archive_all_urls():
        counter = 0
        while counter < self.MAX_WEBSITES_TO_ARCHIVE:
            archive_queued_urls(self.BATCH_SIZE, counter, self.MAX_WEBSITES_TO_ARCHIVE)
            counter += self.BATCH_SIZE
        print('done')



if __name__ == '__main__':
    archiver = ArchiverEurogamer()
    archiver.archive_queued_urls(10, 0, 10)