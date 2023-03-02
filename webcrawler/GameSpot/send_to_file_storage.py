import pathlib
from bs4 import BeautifulSoup
import requests, json, time, random


WEBSITE_NAME = 'GameSpot'
ARCHIVE_FOLDER_PATH = '../../data/_archive/'
FILE_STORAGE_PATH = f'/_website_backups/{WEBSITE_NAME}'

START_YEAR = 1996
STOP_YEAR  = 1996



def get_webpage(url):
    source = requests.get(url).text
    return source


def send_article_to_storage(article):
    # parse the bits we need (for folder / filename)
    url = article['url']
    month = article['date'].split('/')[0]
    day   = article['date'].split('/')[1]
    year  = article['date'].split('/')[2]

    # set target folder and filename
    folder_path = f'{FILE_STORAGE_PATH}/{year}/{month}'

    # in the example below, we want 'endorfun-review_1900-2535824' -- lop off first 4 '/' sections
    # https://www.gamespot.com/reviews/endorfun-review/1900-2535824/
    # NOTE: IF YOU CHANGE THIS, CHANGE THE OTHER FILE'S NAMING SCHEME TOO!!!!!!!!!!!!
    filename = f'{day}_{"_".join(url.split("/")[4:])}'
    # NOTE: IF YOU CHANGE THIS, CHANGE THE OTHER FILE'S NAMING SCHEME TOO!!!!!!!!!!!!

    # if ends in underscore, remove it
    if filename[-1] == '_':
        filename = filename[:-1]

    # make sure folder path exists
    pathlib.Path(folder_path).mkdir(parents=True, exist_ok=True)

    # and save
    raw_html = get_webpage(url)
    with open(f'{folder_path}/{filename}.html', "w", encoding="utf-8") as html_file:
        html_file.write(raw_html)


def get_total_articles(articles_for_year):
    total_count = 0
    for month in articles_for_year:
        for day in articles_for_year[month]:
            for article in articles_for_year[month][day]:
                # skip articles from other sites
                if article['website'] != WEBSITE_NAME:
                    continue

                total_count += 1

    return total_count


# find all urls
def save_articles_for_year(year):
    # open file
    articles_for_year = {}
    with open(f'{ARCHIVE_FOLDER_PATH}{str(year)}.json') as f:
        articles_for_year = json.load(f)

    # figure out total number of articles
    total_article_count = get_total_articles(articles_for_year)
    counter = 1

    # for each month.day entry...
    for month in articles_for_year:
        for day in articles_for_year[month]:
            for article in articles_for_year[month][day]:
                # skip articles from other sites
                if article['website'] != WEBSITE_NAME:
                    continue

                print(f'saving article {article["title"]}....{counter} of {total_article_count}')
                send_article_to_storage(article)
                counter += 1

                # don't spam
                time.sleep(random.uniform(0.7, 1.6))

    

save_articles_for_year(2000)