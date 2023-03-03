from bs4 import BeautifulSoup
import requests
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from datetime import datetime
import time
import tempfile

# constants
BASE_URL = 'https://www.ign.com'
ARTICLE_DIV_CLASS = 'card-item__content'
ARTICLE_TITLE_CLASS = 'card-item__link'
DATETIME_FORMAT = '%A, %b %d, %Y %I:%M%p'

# =================================================== #
# ============== SET THESE VARS ===================== #
USE_PROXY = False
SCROLL_PAUSE_TIME = 1
SCROLL_AMOUNT = 10000
# =================================================== #
# =================================================== #

FIREFOX_PROFILE_PATH = 'C:/Users/Joey/AppData/Local/Mozilla/Firefox/Profiles/664pfqwg.default'
FIREFOX_BINARY_PATH = "C:\\Program Files\\Mozilla Firefox\\firefox.exe"
GECKO_DRIVER_PATH = '../../vendor/geckodriver/geckodriver.exe'


def get_website_soup(url):
    source = requests.get(url).content
    soup = BeautifulSoup(source, 'lxml')
    return soup


def get_links_from_news_page(page_number, proxy, target_page='news/'):
    # download webpage
    url = f'{BASE_URL}/{target_page}?page={str(page_number)}'
    source = requests.get(url, proxies = {'http': proxy, 'https': proxy}).text if USE_PROXY else requests.get(url).text
    soup = BeautifulSoup(source, 'lxml')

    return soup

    # articles = soup.find_all('div', class_=ARTICLE_DIV_CLASS)

    # article_data = []

    # for article in articles:
    #     article_title = article.a.h4.text
    #     article_url   = article.a['href']
    #     article_date  = article.find('time')['datetime']

    #     # convert to datetime
    #     article_date = datetime.strptime(article_date, DATETIME_FORMAT)

    #     article_data.append({
    #         'title': article_title,
    #         'url': article_url,
    #         'date': article_date
    #     })

    # return article_data


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


def get_webdriver():
    return webdriver.Firefox()



# Web scrapper for infinite scrolling page
driver = get_webdriver()
driver.get('https://www.ign.com/reviews')


time.sleep(2)  # Allow 2 seconds for the web page to open
screen_height = driver.execute_script("return window.screen.height;")   # get the screen height of the web
i = 1

while True:
    # scroll one screen height each time
    driver.execute_script("window.scrollTo(0, {screen_height}*{i});".format(screen_height=SCROLL_AMOUNT, i=i))  
    i += 1
    time.sleep(SCROLL_PAUSE_TIME)
    # update scroll height each time after scrolled, as the scroll height can change after we scrolled the page
    scroll_height = driver.execute_script("return document.body.scrollHeight;")
    print(f'scrolling {i}...')
    # Break the loop when the height we need to scroll to is larger than the total scroll height
    # if (screen_height) * i > scroll_height:
    #     print('nothing more to scroll, closing')
    #     break

driver.quit()
print(f'got to {i}th scroll. done.')