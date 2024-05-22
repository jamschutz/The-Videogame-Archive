from Core.Config import Config
from Core.Utils import Utils
from Core.DbManager import DbManager
from .helpers.web_scraper import get_links

from pathlib import Path
from datetime import datetime
import logging



class UrlIndexerGameSpot:
    
    def __init__(self):
        self.website_name = 'GameSpot'
        self.db_manager = DbManager()
        self.config = Config()
        self.utils = Utils()


    def index_target_months(self):
        # get most recent logged article
        website_id = self.config.website_id_lookup[self.website_name]
        last_archived_article_date = self.db_manager.get_most_recent_article_date(website_id)

        # get actual articles from site
        news_articles = self.__get_articles_after_date('news', last_archived_article_date)
        reviews_articles = self.__get_articles_after_date('games/reviews', last_archived_article_date)

        # assign types
        for article in news_articles:
            article['type'] = 'news'
        for article in reviews_articles:
            article['type'] = 'review'

        # build full list of articles
        articles = []
        articles.extend(news_articles)
        articles.extend(reviews_articles)        

        # add / clean up fields
        for article in articles:
            article['date_published'] = f'{self.utils.date_to_num(a['date'])}'
            # we will get the actual values for these when we archive them -- for now, just put down whatever so we can insert non-null values into the db!
            article['author'] = self.config.PLACEHOLDER_AUTHOR_NAME
            article['subtitle'] = ''


        print(articles)

        # # save articles to database
        # self.db_manager.save_articles(articles)


    def __get_articles_after_date(self, target_page, target_date):
        articles = []
        page = 1

        while True:
            try:
                # get articles at page number
                logging.info(f'fetching {target_page}, page {page}')
                print(f'fetching {target_page}, page {page}')
                article_links = get_links(page, target_page, self.utils)

                # add articles on page to global list
                articles.extend(article_links)

                # if any of the article's dates are older than our last archived date, break
                if any(self.utils.date_to_num(a['date']) < target_date for a in article_links):
                    return articles

                page += 1

            except Exception as e:
                # show error
                logging.info(f'{str(e)}\n\n-------------------------unable to get archive month for GameSpot----------------')
                print(f'{str(e)}\n\n-------------------------unable to get archive month for GameSpot----------------')
                return articles


    



if __name__ == '__main__':
    indexer = UrlIndexerGameSpot()
    indexer.index_target_months()