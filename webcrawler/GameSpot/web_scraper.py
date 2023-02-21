from bs4 import BeautifulSoup
import requests
from selenium import webdriver
from datetime import datetime

# constants
BASE_URL = 'https://www.gamespot.com'
ARTICLE_DIV_CLASS = 'card-item__content'
ARTICLE_TITLE_CLASS = 'card-item__link'
DATETIME_FORMAT = '%A, %b %d, %Y %I:%M%p'


def get_website_soup(url):
    source = requests.get(url).content
    soup = BeautifulSoup(source, 'lxml')
    return soup


def get_links_from_news_page(page_number, proxy, target_page='news/', use_proxy=True):
    # download webpage
    url = f'{BASE_URL}/{target_page}?page={str(page_number)}'
    source = requests.get(url, proxies = {'http': proxy, 'https': proxy}).text if use_proxy else requests.get(url).text
    soup = BeautifulSoup(source, 'lxml')

    articles = soup.find_all('div', class_=ARTICLE_DIV_CLASS)

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
            'date': article_date
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


