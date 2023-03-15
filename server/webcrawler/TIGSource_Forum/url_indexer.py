from server._shared.DbManager import DbManager
from server._shared.Config import Config
from server._shared.Utils import Utils

import json, time, random, requests
from pathlib import Path
from datetime import datetime
from bs4 import BeautifulSoup

BASE_URL = 'https://forums.tigsource.com/'
WEBSITE_NAME = 'TIGSource Forum'
WEBSITE_ID = 6

PAGE_URL = {
    'Townhall': 'https://forums.tigsource.com/index.php?board=17.0',
    'DevLogs': 'https://forums.tigsource.com/index.php?board=27.0',
    'Jams & Events': 'https://forums.tigsource.com/index.php?board=15.0',
    'Playtesting': 'https://forums.tigsource.com/index.php?board=6.0',
    'Art': 'https://forums.tigsource.com/index.php?board=24.0',
    'Audio': 'https://forums.tigsource.com/index.php?board=26.0',
    'Design': 'https://forums.tigsource.com/index.php?board=25.0',
    'Technical': 'https://forums.tigsource.com/index.php?board=4.0',
    'Business': 'https://forums.tigsource.com/index.php?board=3.0',
    'Offering Paid Work': 'https://forums.tigsource.com/index.php?board=40.0',
    'Portfolios': 'https://forums.tigsource.com/index.php?board=43.0',
    'Collaborations': 'https://forums.tigsource.com/index.php?board=8.0',
    'General': 'https://forums.tigsource.com/index.php?board=1.0',
    'Games': 'https://forums.tigsource.com/index.php?board=2.0',
    'Table Talk': 'https://forums.tigsource.com/index.php?board=57.0'
}

# we'll build the url with {BASEURL}.{offset}, e.g.: https://forums.tigsource.com/index.php?board=17.0.8850
PAGE_MAX_OFFSET = {
    'Townhall': 8850,
    'DevLogs': 11280,
    'Jams & Events': 1050,
    'Playtesting': 8610,
    'Art': 1800,
    'Audio': 1800,
    'Design': 1980,
    'Technical':5280,
    'Business': 2220,
    'Offering Paid Work': 1860,
    'Portfolios': 3300,
    'Collaborations': 2610,
    'General': 5010,
    'Games': 3240,
    'Table Talk': 0
}

# this doesn't change depending on the section
# we can use this to iterate the page urls (e.g. next page is current_offset + posts_per_page)
POSTS_PER_PAGE = 30



MAX_PAGE = 232
DATETIME_FORMAT = '%B %d, %Y'

db = DbManager()
config = Config()
utils = Utils()

# ================================= #
# == set these variables!!! ======= #
START_PAGE_NUMBER = 50    # = #
END_PAGE_NUMBER   = 1           # = #
# ================================= #
# ================================= #


def get_links_from_page(page_number):
    # download webpage
    url = f'{BASE_URL}/page/{str(page_number)}' if page_number > 1 else BASE_URL
    source = requests.get(url).text
    soup = BeautifulSoup(source, 'lxml')

    # articles = soup.find_all('div', class_='blog_post')

    # article_data = []
    # for article in articles:
    #     title  = article.h1.a.text.strip()
    #     url    = article.h1.a['href']
    #     author = article.h2.text.strip()[len('By: '):] # remove opening 'By: ' from text
    #     tags   = get_tags(article)
    #     thumbnail = article.find('img')['src'] if article.find('img') != None else None
    #     # date time is in format: Month Day, Year
    #     # we only care about the date, so split on the space and take only the first part
    #     date  = article.h3.text.strip()

    #     # if thumbnail starts with '//', add 'https:' to the start
    #     if thumbnail != None and thumbnail[0:2] == '//':
    #         thumbnail = f'https:{thumbnail}'

    #     # convert to datetime
    #     date = get_date(date)

    #     article_data.append({
    #         'title': title,
    #         'url': url,
    #         'date': date,
    #         'author': author,
    #         'website': WEBSITE_NAME,
    #         'tags': tags
    #     })

    #     # if we have a thumbnail, tack it on
    #     if thumbnail != None:
    #         article_data[-1]['thumbnail'] = thumbnail

    # return article_data


def index_pages(start_page, end_page):
    articles = []

    page = start_page
    while page >= end_page:
        try:
            # get articles at page number
            print(f'fetching page {str(page)}')
            article_links = get_links_from_page(page)

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
        
        article['year']  = article['date'].split('/')[2]
        article['month'] = article['date'].split('/')[0]
        article['day']   = article['date'].split('/')[1]

    # save articles to database
    # print('saving to db...')
    # db.save_articles(articles)


if __name__ == '__main__':
    index_pages(START_PAGE_NUMBER, END_PAGE_NUMBER)
    print('done')