from server._shared.DbManager import DbManager
from server._shared.Config import Config
from server._shared.Utils import Utils

import json, time, random, requests
from pathlib import Path
from datetime import datetime
from bs4 import BeautifulSoup

BASE_URL = 'https://www.tigsource.com'
WEBSITE_NAME = 'TIGSource'
WEBSITE_ID = 5
MAX_PAGE = 232
DATETIME_FORMAT = '%B %d, %Y'

db = DbManager()
config = Config()
utils = Utils()

# ================================= #
# == set these variables!!! ======= #
START_PAGE_NUMBER = MAX_PAGE    # = #
END_PAGE_NUMBER   = MAX_PAGE           # = #
# ================================= #
# ================================= #


def get_links_from_page(page_number):
    # download webpage
    url = f'{BASE_URL}/page/{str(page_number)}' if page_number > 1 else BASE_URL
    source = requests.get(url).text
    soup = BeautifulSoup(source, 'lxml')

    articles = soup.find_all('div', class_='blog_post')

    article_data = []
    for article in articles:
        title  = article.h1.a.text.strip()
        url    = article.h1.a['href']
        author = article.h2.text.strip()[len('By: '):] # remove opening 'By: ' from text
        tags   = get_tags(article)
        thumbnail = article.find('img')['src'] if article.find('img') != None else None
        # date time is in format: Month Day, Year
        # we only care about the date, so split on the space and take only the first part
        date  = article.h3.text.strip()

        # if thumbnail starts with '//', add 'https:' to the start
        if thumbnail != None and thumbnail[0:2] == '//':
            thumbnail = f'https:{thumbnail}'

        # convert to datetime
        date = get_date(date)

        article_data.append({
            'title': title,
            'url': url,
            'date': date,
            'author': author,
            'website': WEBSITE_NAME,
            'tags': tags
        })

        # if we have a thumbnail, tack it on
        if thumbnail != None:
            article_data[-1]['thumbnail'] = thumbnail

    return article_data


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

        # build thumbnail filename...
        if 'thumbnail' in article:
            # if there's no file extension, just slap a .jpg on it
            day_2digits = utils.get_two_char_int_string(int(article['day']))
            thumbnail_file_extension = article['thumbnail'].split('.')[-1] if article['thumbnail'][-4] == '.' else '.jpg'
            article['thumbnail_filename'] = f"{config.url_to_filename(article['url'], day_2digits, WEBSITE_ID)}_thumbnail.{thumbnail_file_extension}"

            # and save the thumbnail
            send_thumbnail_to_archive(article)

    # save articles to database
    print('saving to db...')
    db.save_articles(articles)


def send_thumbnail_to_archive(article):
    month = utils.get_two_char_int_string(int(article['month']))
    year  = article['year']
    filepath = f'{config.ARCHIVE_FOLDER}/{WEBSITE_NAME}/_thumbnails/{year}/{month}'

    utils.save_thumbnail(article['thumbnail'], article['thumbnail_filename'], filepath)


def get_date(date):
    # begins like: "On: May 3rd, 2006"
    # remove "On: "
    date = date[len('On: '):]

    # get component parts
    day   = date.split(' ')[1]
    month = date.split(' ')[0]
    year  = date.split(' ')[2]

    # remove day suffix
    day = ''.join(c for c in day if c.isdigit())

    # and return it all together
    return datetime.strptime(f'{month} {day}, {year}', DATETIME_FORMAT)


def get_tags(article):
    tags_div = article.find('div', class_='blog_post_footer').find_all('a', rel=True)
    tags = []

    for tag in tags_div:
        if 'tag' in tag['rel']:
            tags.append(tag.text.strip().lower())

    return tags


if __name__ == '__main__':
    index_pages(START_PAGE_NUMBER, END_PAGE_NUMBER)
    print('done')