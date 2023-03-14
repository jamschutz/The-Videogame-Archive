from server._shared.DbManager import DbManager

import json, time, random, requests
from pathlib import Path
from datetime import datetime
from bs4 import BeautifulSoup

BASE_URL = 'https://www.tigsource.com'
WEBSITE_NAME = 'TIGSource'
MAX_PAGE = 232
DATETIME_FORMAT = '%B %d, %Y'

DB_MANAGER = DbManager()

# ================================= #
# == set these variables!!! ======= #
START_PAGE_NUMBER = MAX_PAGE    # = #
END_PAGE_NUMBER   = 1           # = #
# ================================= #
# ================================= #


def get_links_from_news_page(page_number):
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
        tags   = article.find('div', class_='blog_post_footer').find_all('a', rel=True)
        tags   = get_tags(tags)
        # date time is in format: Month Day, Year
        # we only care about the date, so split on the space and take only the first part
        date  = article.h3.text.strip()


        # convert to datetime
        date = get_date(date)

        article_data.append({
            'title': title,
            'url': url,
            # 'date': date,
            'date': date.strftime('%m/%d/%Y'),
            'author': author,
            'website': WEBSITE_NAME,
            'tags': tags
        })

    return article_data


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


def get_tags(tags_div):
    tags = []

    for tag in tags_div:
        if 'tag' in tag['rel']:
            tags.append(tag.text.strip().lower())

    return tags


if __name__ == '__main__':
    links = get_links_from_news_page(232)
    print(links)