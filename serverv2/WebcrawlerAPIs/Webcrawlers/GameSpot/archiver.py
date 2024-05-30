from bs4 import BeautifulSoup
import requests
from Core.DB.ArticlesManager import ArticlesManager
from Core.DB.WebsitesManager import WebsitesManager
from Core.Utils import Utils
from Core.AzureStorageManager import AzureStorageManager
from Core.Archiver import Archiver
from Core.SearchIndexer import SearchIndexer
from Entities.Article import Article


class ArchiverGameSpot:

    def __init__(self):
        # basic helpers
        self.website_name = 'GameSpot'
        self.az_storage_manager = AzureStorageManager()
        self.archiver = Archiver()
        self.search_indexer = SearchIndexer()
        self.articles_manager = ArticlesManager()
        self.utils = Utils()
        self.website_id = WebsitesManager().get_id(self.website_name)
        self.BATCH_SIZE = 500

        # article div info
        self.SUBTITLE_DIV_CLASS = 'news-deck'
        self.AUTHOR_DIV_CLASS = 'byline-author'



    def get_article_data(self, article, raw_html):
        # parse html
        soup = BeautifulSoup(raw_html, 'lxml')

        try:
            # add info we need
            # not all articles have subtitles...
            article.subtitle = soup.find('p', class_=self.SUBTITLE_DIV_CLASS)
            if article.subtitle == None:
                article.subtitle = ''
            else:
                article.subtitle = article.subtitle.text.strip()

            article.author = soup.find('span', class_=self.AUTHOR_DIV_CLASS).a.text.strip()
            # NOTE: not getting type because we already got it
            # NOTE: not getting thumbnail url because we stored that in the url indexing phase

            return article

        except Exception as e:
            print(f'ERROR parsing: {article.title}: {str(e)}')
            return None
        

    def get_article_content(self, raw_html):
        soup = BeautifulSoup(raw_html, 'lxml')
        paragraphs = soup.find('div', class_="content-entity-body").find_all('p')

        content = ""
        for paragraph in paragraphs:
            content += f' {paragraph.text}'
        
        return content



    def archive_queued_urls(self, num_urls_to_archive, counter_offset=0, actual_max=-1):
        actual_max = num_urls_to_archive if actual_max < 0 else actual_max
        # get articles to archive
        articles_to_archive = self.articles_manager.get_articles_to_archive(num_urls_to_archive, self.website_id)

        # and archive each one
        counter = 1
        for article in articles_to_archive:
            print(f'saving article {article.title} ({article.date})....[{counter + counter_offset}/{actual_max}]')
            
            # download webpage
            raw_html = requests.get(article.url).text

            # get article data
            article = self.get_article_data(article, raw_html)
            content = self.get_article_content(raw_html)

            print(article.to_string())
            print(content)
            
            # # if None, something went wrong, just skip
            # if article != None:
            #     # save to filepath
            #     self.archiver.send_article_to_archive(article, raw_html, self.website_name)
            #     self.archiver.send_thumbnail_to_archive(article, self.website_name)
            #     self.search_indexer.index_article(content, article.id)

            #     # and update its info in the DB
            #     self.articles_manager.update_article(article, self.website_id)

            counter += 1

        # # get list of articles that were succesfully archived
        # articles_archived_successfully = [a for a in articles_to_archive if a is not None]
        
        # # and mark as archived in the db
        # self.articles_manager.mark_articles_as_archived(articles_archived_successfully)
    

if __name__ == '__main__':
    archiver = ArchiverGameSpot()
    archiver.archive_queued_urls(1, 0, 1)