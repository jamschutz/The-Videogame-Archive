from bs4 import BeautifulSoup
import requests
from selenium import webdriver
from datetime import datetime

# constants
BASE_URL = 'https://www.gameplanet.co.nz'
WEBSITE_NAME = 'Gameplanet'
ARTICLE_TABLE_DIV_CLASS = 'index-table'

# in format: Wednesday, Feb 15, 2023 10:36am
# DATETIME_FORMAT = '%A, %b %d, %Y %I:%M%p'

# in format: 2000-09-14 07:51:39+12:00
DATETIME_FORMAT = '%Y-%m-%d'


def get_website_soup(url):
    source = requests.get(url).content
    soup = BeautifulSoup(source, 'lxml')
    return soup


def get_links_from_news_page(page_number, target_page='news/'):
    # download webpage
    url = f'{BASE_URL}/{target_page}/page{str(page_number)}' if page_number > 1 else f'{BASE_URL}/{target_page}'
    source = requests.get(url).text
    soup = BeautifulSoup(source, 'lxml')

    articles = soup.find('table', class_=ARTICLE_TABLE_DIV_CLASS).find_all('tr')

    article_data = []

    for article in articles:
        article_title = article.find('td', class_='title').h5.a.text.strip()
        article_url   = article.find('td', class_='title').h5.a['href']
        # date time is in format: 2000-09-14 07:51:39+12:00
        # we only care about the date, so split on the space and take only the first part
        article_date  = article.find('td', class_='date').time['datetime'].split(' ')[0]

        # convert to datetime
        article_date = datetime.strptime(article_date, DATETIME_FORMAT)

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