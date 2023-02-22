from bs4 import BeautifulSoup
import requests
from selenium import webdriver
from datetime import datetime

# constants
BASE_URL = 'https://www.eurogamer.net/archive'
CONTAINER_DIV_CLASS = 'archive_by_date_items'
WEBSITE_NAME = 'Eurogamer'

# in format YYYY-MM-DD
DATETIME_FORMAT = '%Y-%m-%d'

# ARTICLE_DIV_CLASS = 'card-item__content'
# ARTICLE_TITLE_CLASS = 'card-item__link'
# in format: Wednesday, Feb 15, 2023 10:36am
# DATETIME_FORMAT = '%A, %b %d, %Y %I:%M%p'

def get_website_soup(url):
    source = requests.get(url).content
    soup = BeautifulSoup(source, 'lxml')
    return soup


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
                'date': article_date,
                'website': WEBSITE_NAME
            })

    return article_data


# use a proxy by: requests.get('url', proxies = {'http': proxy, 'https': proxy})
def get_free_proxies():
    soup = get_website_soup('https://free-proxy-list.net/')
    
    # create empty list for proxies
    proxies = []

    # find the proxy table, and store the rows
    proxy_table = soup.find('table').tbody.find_all('tr')
    for row in proxy_table:
        try:
            cols = row.find_all('td')
            ip   = cols[0].text.strip()
            port = cols[1].text.strip()

            proxies.append(f'{str(ip)}:{str(port)}')
        except IndexError:
            continue

    return proxies


def get_webpage(url, proxy):
    source = requests.get(url, proxies = {'http': proxy, 'https': proxy}).text
    return source


