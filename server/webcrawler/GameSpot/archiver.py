import pathlib
from bs4 import BeautifulSoup
import requests, json, time, random
from server._shared.Config import Config
from server._shared.DbManager import DbManager


WEBSITE_NAME = 'GameSpot'
MAX_WEBSITES_TO_ARCHIVE = 150


# initialize helpers
config = Config()
db_manager = DbManager()



def send_article_to_storage(article):
    # parse the bits we need (for folder / filename)
    url = article['url']
    month = article['month']
    day   = article['day']
    year  = article['year']

    # set target folder and filename
    folder_path = f'{config.ARCHIVE_FOLDER}/{WEBSITE_NAME}/{year}/{month}'

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
    raw_html = requests.get(url).text
    with open(f'{folder_path}/{filename}.html', "w", encoding="utf-8") as html_file:
        html_file.write(raw_html)



def archive_queued_urls(num_urls_to_archive):
    # get articles to archive
    website_id = config.website_id_lookup[WEBSITE_NAME]
    articles_to_archive = db_manager.get_urls_to_archive(num_urls_to_archive, website_id)

    # and archive each one
    counter = 1
    for article in articles_to_archive:
        print(f'saving article {article["title"]} ({article["month"]}/{article["day"]}/{article["year"]})....[{counter}/{num_urls_to_archive}]')
        send_article_to_storage(article)

        # don't spam
        time.sleep(random.uniform(0.7, 1.6))
        counter += 1

    db_manager.mark_articles_as_archived(articles_to_archive)



if __name__ == '__main__':
    archive_queued_urls(MAX_WEBSITES_TO_ARCHIVE)