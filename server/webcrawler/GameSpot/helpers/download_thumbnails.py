from bs4 import BeautifulSoup
import requests
from datetime import datetime
from server._shared.Config import Config
from server._shared.DbManager import DbManager
from server._shared.Utils import Utils

# in format: Wednesday, Feb 15, 2023 10:36am
DATETIME_FORMAT = '%A, %b %d, %Y %I:%M%p'

config = Config()
db = DbManager()
utils = Utils()

def get_thumbnails_from_page(page_number, target_page='news/'):
    # download webpage
    url = f'https://www.gamespot.com/{target_page}?page={str(page_number)}' if page_number > 1 else f'{BASE_URL}/{target_page}'
    source = requests.get(url).text
    soup = BeautifulSoup(source, 'lxml')

    article_divs = soup.find_all('div', class_='card-item')

    thumbnail_divs = soup.find_all('div', class_='card-item__img')

    thumbnails = []

    for div in article_divs:
        thumbnail_url = div.find('div', class_='card-item__img').img['src']
        article_date = div.find('div', class_='card-item__content').find('time')['datetime']

        # convert to datetime
        article_date = datetime.strptime(article_date, DATETIME_FORMAT)
        article_date = article_date.strftime('%m/%d/%Y')

        thumbnails.append({
            'img_url': thumbnail_url,
            'year':  article_date.split('/')[2],
            'month': article_date.split('/')[0],
            'day':   article_date.split('/')[1]
        })

    return thumbnails


if __name__ == '__main__':
    print(get_thumbnails_from_page(4435))
    # start_page = 4435
    # end_page = 4435
    # target_page = 'news/'

    # page = start_page
    # while page >= end_page:
    #     # get thumbnails
    #     print(f'getting thumbnails for page {page}...')
    #     thumbnails = get_thumbnails_from_page(page, target_page)

    #     # save each one to disk
    #     for thumbnail in thumbnails:
    #         filename = config.url_to_filename()
