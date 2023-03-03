import web_scraper as ws
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


MAX_NEWS_PAGE = 635
MAX_REVIEWS_PAGE = 1
MAX_PREVIEWS_PAGE = 1
MAX_FEATURES_PAGE = 1

# ================================= #
# == set these variables!!! ======= #
TARGET_PAGE = NEWS_URL    # ======= #
START_PAGE_NUMBER = 635     # ======= #
END_PAGE_NUMBER   = 1     # ======= #
PAGES_PER_FILE    = 75    # ======= #
# ================================= #
# ================================= #


def save_sitemap(start_page, end_page, target_page):
    sitemap = []

    page = start_page

    # build sitemap 1 by 1, rotating proxies as needed
    while page >= end_page:
        try:
            # get articles at page number
            print(f'fetching page {str(page)}')
            article_links = ws.get_links_from_news_page(page, target_page=target_page)

            # if we got here, proxy worked!
            sitemap.extend(article_links)
            page -= 1

            # don't spam
            time.sleep(random.uniform(0.9, 2.1))
        except Exception as e:
            # bail on error
            print(f'{str(e)}\n\n----------something happened. bailing at page {page}----------')
            break
    
    # sort by date
    sitemap = sorted(sitemap, key=lambda d: d['date']) 

    # for each article, convert datetime back to string (so it saves okay)
    for article in sitemap:
        article['date'] = article['date'].strftime('%m/%d/%Y')
        article['url'] = f'{BASE_URL}{article["url"]}'

    earliest_article_date = sitemap[0]['date'].replace('/', '')
    latest_article_date   = sitemap[-1]['date'].replace('/', '')
    filename = f'{WEBSITE_NAME}_{target_page}_{earliest_article_date}-{latest_article_date}.json'

    # save sitemap
    with open(f"../../data/_dumps/{filename}", "w") as json_file:
        json.dump(sitemap, json_file)


def save_wegpage(url, date, title):
    proxies = ws.get_free_proxies()

    # parse year / month / day from date
    date_dt = datetime.strptime(date, DATETIME_FORMAT)
    year = date_dt.strftime("%Y")
    month = date_dt.strftime('%m')
    day = date_dt.strftime('%d')

    # build folder path
    folder_path = f'../../archive/{str(year)}/{str(month)}'
    filename = f'GameSpot_{str(day)}-{str(month)}-{str(year)}_{title}.html'

    # grab webpage
    for proxy in proxies:
        try:
            webpage = ws.get_webpage(url, proxy)

            # if we got here, it was a success!
            print('success!')

            # save to file
            Path(folder_path).mkdir(parents=True, exist_ok=True) # ensure folder exists
            with open(f'{folder_path}/{filename}', "w") as html_file:
                html_file.write(webpage)

            # stop searching with proxies
            break

        except:
            """ just keep trying proxies """
            print('trying next proxy...')


current_page = START_PAGE_NUMBER
while current_page >= END_PAGE_NUMBER:
    page_start = current_page
    page_end   = current_page - (PAGES_PER_FILE - 1)
    if page_end < END_PAGE_NUMBER:
        page_end = END_PAGE_NUMBER

    print(f'current page: {current_page}; start: {page_start}, end: {page_end}')

    save_sitemap(page_start, page_end, TARGET_PAGE)
    current_page -= PAGES_PER_FILE



# save_sitemap(START_PAGE_NUMBER, END_PAGE_NUMBER, TARGET_PAGE)
print('done')


# save_sitemap()
# proxies = ws.get_free_proxies()