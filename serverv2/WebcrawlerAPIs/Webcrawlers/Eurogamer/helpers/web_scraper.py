from bs4 import BeautifulSoup
import requests
from datetime import datetime

# constants
BASE_URL = 'https://www.eurogamer.net/archive'
CONTAINER_DIV_CLASS = 'archive_by_date_items'
WEBSITE_NAME = 'Eurogamer'

# in format YYYY-MM-DD
DATETIME_FORMAT = '%Y-%m-%d'


def get_links_from_archive_month(month, year):
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

            # convert to datetime
            article_date = datetime.strptime(date, DATETIME_FORMAT)

            article_data.append({
                'title': article_title,
                'url': article_url,
                'date': article_date.strftime('%m/%d/%Y'),
                'website': WEBSITE_NAME
            })

    return article_data


