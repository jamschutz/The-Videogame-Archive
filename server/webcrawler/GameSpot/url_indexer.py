from ..GameSpot.helpers.web_scraper import *
from ..._shared.Config import Config
from ..._shared.DbManager import DbManager

import json, time
from pathlib import Path
from datetime import datetime
import random

BASE_URL = 'https://www.gamespot.com'
NEWS_URL = 'news/'
REVIEWS_URL = 'games/reviews/'

START_PAGE_NEWS = 25
END_PAGE_NEWS   = 1

START_PAGE_REVIEWS = 25
END_PAGE_REVIEWS = 1

DATETIME_FORMAT = '%A, %b %d, %Y %I:%M%p'
EXTEND_EXISTING = True

CONFIG = Config()
DB_MANAGER = DbManager()



# ========================================== #
# ======= CHANGE THESE VALUES ============== #
TARGET_PAGE = NEWS_URL
# ========================================== #
# ========================================== #


def save_sitemap(target_page):
    proxies = get_free_proxies()
    articles = []

    start_page = START_PAGE_NEWS if target_page == NEWS_URL else START_PAGE_REVIEWS
    end_page   = END_PAGE_NEWS if target_page == NEWS_URL else END_PAGE_REVIEWS

    page = start_page
    current_proxy = 0
    consecutive_bad_proxy_attempts = 0

    # build sitemap 1 by 1, rotating proxies as needed
    while current_proxy < len(proxies) and page >= end_page:
        try:
            # get articles at page number
            print(f'fetching page {str(page)}. proxies remaining: {str(len(proxies) - current_proxy)}')
            article_links = get_links_from_news_page(page, proxies[current_proxy], target_page=target_page, use_proxy=False)

            # if we got here, proxy worked!
            articles.extend(article_links)
            page -= 1
            consecutive_bad_proxy_attempts = 0

            # don't spam
            time.sleep(random.uniform(0.9, 2.1))
        except Exception as e:
            # get next proxy
            print(f'{str(e)}\n\n----------port {proxies[current_proxy]} is bad. trying next one----------')
            current_proxy += 1
            consecutive_bad_proxy_attempts += 1

            # if we keep getting bad proxies, just bail
            if consecutive_bad_proxy_attempts > 30:
                break
            time.sleep(random.uniform(0.9, 2.1))
    
    # sort by date
    articles = sorted(articles, key=lambda d: d['date']) 

    # for each article, convert datetime back to string (so it saves okay)
    for article in articles:
        article['date'] = article['date'].strftime('%m/%d/%Y')
        article['year']  = article['date'].split('/')[2]
        article['month'] = article['date'].split('/')[0]
        article['day']   = article['date'].split('/')[1]

        article['url'] = f"{BASE_URL}{article['url']}"
        article['website'] = 'GameSpot'
        article['type'] = 'news' if target_page == NEWS_URL else 'review'

    # save articles to database
    DB_MANAGER.save_articles(articles)


print('saving news...')
save_sitemap(NEWS_URL)
print('saving reviews...')
save_sitemap(REVIEWS_URL)
print('done')