import pathlib
from bs4 import BeautifulSoup
import requests, json, time, random
from server._shared.Config import Config
from server._shared.DbManager import DbManager
from server._shared.Utils import Utils


WEBSITE_NAME = 'GameSpot'
MAX_WEBSITES_TO_ARCHIVE = 1000
BATCH_SIZE = 100

SUBTITLE_DIV_CLASS = 'news-deck'
AUTHOR_DIV_CLASS = 'byline-author'


# initialize helpers
config = Config()
db_manager = DbManager()
utils = Utils()

ARTICLES_THAT_FAILED_TO_PARSE = []


def add_article_info_to_db(article, raw_html):
    # parse html
    soup = BeautifulSoup(raw_html, 'lxml')

    try:
        # add info we need
        article['subtitle'] = soup.find('p', class_=SUBTITLE_DIV_CLASS).text.strip()
        article['author'] = soup.find('span', class_=AUTHOR_DIV_CLASS).a.text.strip()

        # save to db
        db_manager.update_article(article)
    except Exception as e:
        print(f'ERROR parsing: {article["title"]}: {str(e)}')
        ARTICLES_THAT_FAILED_TO_PARSE.append(article['url'])
        return

    



def send_article_to_archive(article, raw_html):
    # reset articles failed to parse
    ARTICLES_THAT_FAILED_TO_PARSE = []

    # parse the bits we need (for folder / filename)
    url = article['url']
    month = utils.get_two_char_int_string(article['month'])
    day   = utils.get_two_char_int_string(article['day'])
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
    with open(f'{folder_path}/{filename}.html', "w", encoding="utf-8") as html_file:
        html_file.write(raw_html)



def archive_queued_urls(num_urls_to_archive, counter_offset=0, actual_max=-1):
    actual_max = num_urls_to_archive if actual_max < 0 else actual_max
    # get articles to archive
    website_id = config.website_id_lookup[WEBSITE_NAME]
    articles_to_archive = db_manager.get_urls_to_archive(num_urls_to_archive, website_id)

    # and archive each one
    counter = 1
    for article in articles_to_archive:
        print(f'saving article {article["title"]} ({article["month"]}/{article["day"]}/{article["year"]})....[{counter + counter_offset}/{actual_max}]')
        # download webpage
        raw_html = requests.get(article['url']).text
        # save to filepath
        send_article_to_archive(article, raw_html)
        # and update its info in the DB
        add_article_info_to_db(article, raw_html)

        # don't spam
        time.sleep(random.uniform(0.7, 1.6))
        counter += 1

    # get list of articles that were succesfully archived
    articles_archived_successfully = []
    for article in articles_to_archive:
        if article['url'] not in ARTICLES_THAT_FAILED_TO_PARSE:
            articles_archived_successfully.append(article)
    
    # and mark as archived in the db
    db_manager.mark_articles_as_archived(articles_archived_successfully)
    print(f'*********************failed to parse the following articles: {",".join(ARTICLES_THAT_FAILED_TO_PARSE)}')



if __name__ == '__main__':
    counter = 0
    while counter <= MAX_WEBSITES_TO_ARCHIVE:
        archive_queued_urls(BATCH_SIZE, 0, MAX_WEBSITES_TO_ARCHIVE)
        counter += BATCH_SIZE
    print('done')