from bs4 import BeautifulSoup
import requests

# constants
BASE_URL = 'https://www.gamespot.com'
ARTICLE_TITLE_CLASS = 'card-item__link'


def get_website_soup(url):
    source = requests.get(url).content
    soup = BeautifulSoup(source, 'lxml')
    return soup


def get_links_from_news_page(page_number):
    # download webpage
    source = requests.get('https://www.gamespot.com/news/?page=4425').text
    soup = BeautifulSoup(source, 'lxml')

    articles = soup.find_all('a', class_='card-item__link')

    print(len(articles))

    for article in articles:
        print(article['href'])


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


print(get_free_proxies())