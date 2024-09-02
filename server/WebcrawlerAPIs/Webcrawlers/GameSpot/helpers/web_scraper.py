from bs4 import BeautifulSoup
import requests
from datetime import datetime

from Entities.Article import Article

# constants
BASE_URL = 'https://www.gamespot.com'
ARTICLE_DIV_CLASS = 'card-item__content'
ARTICLE_TITLE_CLASS = 'card-item__link'
# in format: Wednesday, Feb 15, 2023 10:36am
DATETIME_FORMAT = '%A, %b %d, %Y %I:%M%p'


def __get_articles(page_number, target_page):
    # download webpage
    url = f'{BASE_URL}/{target_page}?page={str(page_number)}' if page_number > 1 else f'{BASE_URL}/{target_page}'
    source = requests.get(url).text
    soup = BeautifulSoup(source, 'lxml')

    articles = soup.find_all('div', class_='card-item')
    return articles


def get_links(page_number, target_page):
    articles = __get_articles(page_number, target_page)
    article_data = []

    for article in articles:
        content = article.find('div', class_='card-item__content')
        article_title = content.a.h4.text
        article_url   = content.a['href']
        article_date  = content.find('time')['datetime']

        thumbnail_url = article.find('div', class_='card-item__img').img['src']

        # convert to datetime
        article_date = datetime.strptime(article_date, DATETIME_FORMAT)

        article_data.append(Article(
            title = article_title,
            url = f'{BASE_URL}{article_url}',
            date = article_date,
            thumbnail_url=thumbnail_url
        ))

    return article_data