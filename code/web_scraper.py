from bs4 import BeautifulSoup
import requests

# constants
BASE_URL = 'https://www.gamespot.com'
ARTICLE_DIV_CLASS = 'card-item__content'
ARTICLE_TITLE_CLASS = 'card-item__link'
START_PAGE_NEWS = 4425


def get_website_soup(url):
    source = requests.get(url).content
    soup = BeautifulSoup(source, 'lxml')
    return soup


def get_links_from_news_page(page_number, proxy):
    # download webpage
    url = f'{BASE_URL}/news/?page={str(page_number)}'
    source = requests.get(url, proxies = {'http': proxy, 'https': proxy}).text
    soup = BeautifulSoup(source, 'lxml')

    articles = soup.find_all('div', class_=ARTICLE_DIV_CLASS)

    article_data = []

    for article in articles:
        article_title = article.a.h4.text
        article_url   = article.a['href']
        article_date  = article.find('time')['datetime']

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
    # url = f'{BASE_URL}/news/?page={str(page_number)}'
    # source = requests.get(url, proxies = {'http': proxy, 'https': proxy}).text
    source = requests.get(url, proxies = {'http': proxy, 'https': proxy}).text
    return source


print('getting proxies...')
proxies = get_free_proxies()
print('got proxies, getting webpage...')
webpage = get_webpage('https://www.gamespot.com/articles/miyamoto-talks-dolphin-at-space-world-99/1100-2323742/', proxies[10])
# links = get_links_from_news_page(START_PAGE_NEWS, proxies[0])
print('got webpage')
print(webpage)
with open('output.html', 'w') as text_file:
    text_file.write(webpage)

# for proxy in proxies:
#     try:
#         webpage = get_webpage('https://www.gamespot.com/articles/miyamoto-talks-dolphin-at-space-world-99/1100-2323742/', proxy)

#         # if we got here, it was a success!
#         print('success!')

#         # save to file
#         with open("output.html", "w") as text_file:
#             text_file.write(webpage)

#         # stop searching with proxies
#         break

#     except:
#         """ just keep trying proxies """
#         print('trying next proxy...')