from server._shared.Config import Config
from server._shared.DbManager import DbManager

import json, time, random, requests
from pathlib import Path
from datetime import datetime
from bs4 import BeautifulSoup

BASE_URL = 'https://jayisgames.com'

DATETIME_FORMAT = '%A, %b %d, %Y %I:%M%p'

DB_MANAGER = DbManager()


def get_articles():
    # download webpage
    url = f'{BASE_URL}/archives.php'
    source = requests.get(url).text
    soup = BeautifulSoup(source, 'lxml')

    articles = soup.find('div', class_='archive-individual').find('ul', class_='archive-list').find_all('li', class_='archive-list-item')

    article_data = []
    for article in articles:
        # date is in format yyyy.mm.dd
        date = article.text.split(':')[0]
        year = date.split('.')[0]
        month = date.split('.')[1]
        day = date.split('.')[2]

        article_data.append({
            'date': f'{month}/{day}/{year}',
            'url': article.a['href'],
            'title': article.a.text,
            'website': 'JayIsGames',
            'year': year,
            'month': month,
            'day': day
        })


    return article_data


def index_target_months():
    # get articles
    print('fetching articles...')
    articles = get_articles()

    # save articles to database
    print('saving to db...')
    DB_MANAGER.save_articles(articles)


if __name__ == '__main__':
    index_target_months()
    print('done')