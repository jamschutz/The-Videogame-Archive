from bs4 import BeautifulSoup
import requests
from datetime import datetime

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

    articles = soup.find_all('div', class_=ARTICLE_DIV_CLASS)
    return articles


def get_links(page_number, target_page, utils):
    articles = __get_articles(page_number, target_page)
    article_data = []

    for article in articles:
        article_title = article.a.h4.text
        article_url   = article.a['href']
        article_date  = article.find('time')['datetime']

        # convert to datetime
        article_date = datetime.strptime(article_date, DATETIME_FORMAT)

        article_data.append({
            'title': article_title,
            'url': article_url,
            # 'date': utils.date_to_num(article_date)
            'date': article_date
        })

    return article_data