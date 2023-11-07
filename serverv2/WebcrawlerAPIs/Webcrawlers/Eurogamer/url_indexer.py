from Core.DbManager import DbManager
from .helpers.web_scraper import *
from .helpers.utils import get_next_month

import json, time
from pathlib import Path
from datetime import datetime
import random



class UrlIndexerEurogamer:
    
    def __init__(self):
        print('hi')
        self.db_manager = DbManager()

    def index_target_months(self):
        # TODO: get dates programmatically
        START_DATE   = '2023/03'
        STOP_AT_DATE = '2023/03'
        current_date = START_DATE
        articles = []

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
        
        # sort by date
        articles = sorted(articles, key=lambda d: d['date']) 

        # add / clean up fields    
        for article in articles:
            article['date'] = article['date'].strftime('%m/%d/%Y')
            article['year']  = article['date'].split('/')[2]
            article['month'] = article['date'].split('/')[0]
            article['day']   = article['date'].split('/')[1]

        print(articles)

        # save articles to database
        # self.db_manager.save_articles(articles)