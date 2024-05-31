from Core.Config import Config
from Core.Utils import Utils
from Core.DB.ArticlesManager import ArticlesManager
from Core.DB.WebsitesManager import WebsitesManager
from .helpers.web_scraper import *
from .helpers.utils import get_next_month

import json, time
from pathlib import Path
from datetime import datetime
import random
import logging



class UrlIndexerEurogamer:
    
    def __init__(self):
        self.website_name = 'Eurogamer'
        self.articles_manager = ArticlesManager()
        self.config = Config()
        self.utils = Utils()

        self.website_id = WebsitesManager().get_id(self.website_name)


    def index_target_months(self):
        # get most recent logged article
        start_date = str(self.articles_manager.get_most_recent_article_date(self.website_id))

        # convert YYYYMMDD format to YYYY/MM format
        current_date = f'{start_date[0:4]}/{start_date[4:6]}'
        stop_at_date = datetime.utcnow().strftime('%Y/%m')

        articles = []
        while True:
            try:
                # get articles at page number
                logging.info(f'fetching date {current_date}.')
                print(f'fetching date {current_date}.')
                m = current_date.split('/')[1]
                y = current_date.split('/')[0]
                article_links = get_links_from_archive_month(month=m, year=y, website_id=self.website_id)

                # if we got here, proxy worked!
                articles.extend(article_links)
            except Exception as e:
                # show error
                logging.info(f'{str(e)}\n\n----------unable to get archive month----------')
                print(f'{str(e)}\n\n----------unable to get archive month----------')
                return

            # add / clean up fields
            for article in articles:
                # we will get the actual values for these when we archive them -- for now, just put down whatever so we can insert non-null values into the db!
                article.author = self.config.PLACEHOLDER_AUTHOR_NAME
                article.type = 'news'
                article.subtitle = ''

            # save articles to database
            self.articles_manager.insert_articles(articles)

            # if we just got the last date, we can stop
            if current_date == stop_at_date:
                return

            # otherwise, go to the next month
            current_date = get_next_month(current_date)



if __name__ == '__main__':
    eurogamer = UrlIndexerEurogamer()
    eurogamer.index_target_months()