from .helpers.web_scraper import *
from server._shared.Config import Config
from server._shared.DbManager import DbManager
from .helpers.utils import get_next_month

import json, time
from pathlib import Path
from datetime import datetime
import random

BASE_URL = 'https://www.eurogamer.net/archive'
START_DATE   = '2023/03'
STOP_AT_DATE = '2023/03'

DATETIME_FORMAT = '%A, %b %d, %Y %I:%M%p'

DB_MANAGER = DbManager()


def index_target_months():
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

    # save articles to database
    DB_MANAGER.save_articles(articles)


index_target_months()
print('done')