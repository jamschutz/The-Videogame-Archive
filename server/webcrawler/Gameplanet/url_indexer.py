from .helpers.web_scraper import *
from server._shared.DbManager import DbManager

import json, time
from pathlib import Path
from datetime import datetime
import random

BASE_URL = 'https://www.gameplanet.co.nz'
NEWS_URL = 'news'
REVIEWS_URL = 'reviews'
PREVIEWS_URL = 'previews'
FEATURES_URL = 'features'
WEBSITE_NAME = 'Gameplanet'


URL_TO_TYPE_LOOKUP = {
    'news': 'news',
    'reviews': 'review',
    'previews': 'preview',
    'features': 'feature'
}


MAX_NEWS_PAGE = 635
MAX_REVIEWS_PAGE = 56
MAX_PREVIEWS_PAGE = 22
MAX_FEATURES_PAGE = 69

DB_MANAGER = DbManager()

# ================================= #
# == set these variables!!! ======= #
TARGET_PAGE = FEATURES_URL    # ======= #
START_PAGE_NUMBER = 69     # ======= #
END_PAGE_NUMBER   = 1     # ======= #
# ================================= #
# ================================= #


def index_pages(start_page, end_page, target_page):
    articles = []

    page = start_page
    while page >= end_page:
        try:
            # get articles at page number
            print(f'fetching page {str(page)}')
            article_links = get_links_from_news_page(page, target_page=target_page)

            # if we got here, proxy worked!
            articles.extend(article_links)
            page -= 1

            # don't spam
            time.sleep(random.uniform(0.9, 2.1))
        except Exception as e:
            # bail on error
            print(f'{str(e)}\n\n----------something happened. bailing at page {page}----------')
            break
    
    # sort by date
    articles = sorted(articles, key=lambda d: d['date']) 

    # for each article, convert datetime back to string (so it saves okay)
    for article in articles:
        article['date'] = article['date'].strftime('%m/%d/%Y')
        article['url'] = f'{BASE_URL}{article["url"]}'
        article['type'] = URL_TO_TYPE_LOOKUP[target_page]
        
        article['year']  = article['date'].split('/')[2]
        article['month'] = article['date'].split('/')[0]
        article['day']   = article['date'].split('/')[1]

    # save articles to database
    DB_MANAGER.save_articles(articles)


if __name__ == '__main__':
    index_pages(START_PAGE_NUMBER, END_PAGE_NUMBER, TARGET_PAGE)
    print('done')