from bs4 import BeautifulSoup
import requests
from datetime import datetime

from Entities.Article import Article
from .utils import get_article_date

# constants
BASE_URL = 'https://www.eurogamer.net/archive'
CONTAINER_DIV_CLASS = 'archive_by_date_items'

# in format YYYY-MM-DD
DATETIME_FORMAT = '%Y-%m-%d'



def get_links_from_archive_month(month, year, website_id):
    # download webpage
    url = f'{BASE_URL}/{year}/{month}'
    source = requests.get(url).text
    soup = BeautifulSoup(source, 'lxml')

    day_archives = soup.find('div', class_=CONTAINER_DIV_CLASS).ol.find_all('li', recursive=False)

    article_data = []
    for day_archive in day_archives:
        date = day_archive.div.time['datetime']
        articles_on_day = day_archive.ol.find_all('li')

        for article in articles_on_day:
            article_title = article.a.text.strip()
            article_url   = article.a['href']

            # bad link! ignore
            if not article_url.startswith('https://www.eurogamer.net'):
                continue

            # convert to datetime
            article_date = datetime.strptime(date, DATETIME_FORMAT)

            article_data.append(Article(
                title = article_title,
                url = article_url,
                date = get_article_date(article_date),
                website_id = website_id
            ))

    return article_data