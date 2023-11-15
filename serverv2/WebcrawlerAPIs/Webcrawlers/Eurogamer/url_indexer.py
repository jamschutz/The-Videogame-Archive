from Core.Config import Config
from Core.DbManager import DbManager
from .helpers.web_scraper import *
from .helpers.utils import get_next_month

import json, time
from pathlib import Path
from datetime import datetime
import random



class UrlIndexerEurogamer:
    
    def __init__(self):
        self.website_name = 'Eurogamer'
        self.db_manager = DbManager()
        self.config = Config()


    def index_target_months(self):
        # get most recent logged article
        website_id = self.config.website_id_lookup[self.website_name]
        start_date = str(self.db_manager.get_most_recent_article_date(website_id))

        # convert YYYYMMDD format to YYYY/MM format
        current_date = f'{start_date[0:4]}/{start_date[4:6]}'
        stop_at_date = datetime.utcnow().strftime('%Y/%m')

        articles = []
        while True:
            try:
                # get articles at page number
                print(f'fetching date {current_date}.')
                m = current_date.split('/')[1]
                y = current_date.split('/')[0]
                article_links = get_links_from_archive_month(month=m, year=y)

                # if we got here, proxy worked!
                articles.extend(article_links)
            except Exception as e:
                # show error
                print(f'{str(e)}\n\n----------unable to get archive month----------')
                return

            # add / clean up fields    
            for article in articles:
                article['year']  = article['date'].split('/')[2]
                article['month'] = article['date'].split('/')[0]
                article['day']   = article['date'].split('/')[1]

            # # save articles to database
            # # self.db_manager.save_articles(articles)

            # if we just got the last date, we can stop
            if current_date == stop_at_date:
                return

            # otherwise, go to the next month
            current_date = get_next_month(current_date)