import pathlib
from bs4 import BeautifulSoup
import requests, json, time, random
from server._shared.Config import Config
from server._wayback.WaybackDbManager import WaybackDbManager
from server._shared.Utils import Utils


BASE_URL = 'https://www.n64.com'
WEBSITE_NAME = 'N64.com'
WEBSITE_ID = 7
MAX_WEBSITES_TO_ARCHIVE = 10
BATCH_SIZE = 10


# initialize helpers
config = Config()
db_manager = WaybackDbManager()
utils = Utils()

ARTICLES_THAT_FAILED_TO_PARSE = []


def get_html(url):
    print(f'downloading {url["url"]}....')
    # get earliest snapshot for this url
    snapshot = db_manager.get_earliest_url_snapshot(url['id'], WEBSITE_ID)

    # http://web.archive.org/web/20000129130354/www.n64.com/codes/doom/intro/doom64.pdf
    wayback_url = f'http://web.archive.org/web/{snapshot["timestamp"]}/{snapshot["url"]}'

    # return soup
    raw_html = requests.get(wayback_url).text
    raw_html = utils.inject_css(raw_html, "https://web.archive.org")
    return raw_html



def send_article_to_archive(article, raw_html):
    # reset articles failed to parse
    ARTICLES_THAT_FAILED_TO_PARSE = []

    # parse the bits we need (for folder / filename)
    url = article['url']
    date_published = str(article['date'])
    year = date_published[:4]
    month = date_published[4:6]
    day = date_published[6:]

    # set target folder and filename
    folder_path = f'{config.ARCHIVE_FOLDER}/{WEBSITE_NAME}/{year}/{month}'
    filename = config.url_to_filename(url, day, WEBSITE_ID)

    # make sure folder path exists
    pathlib.Path(folder_path).mkdir(parents=True, exist_ok=True)

    # and save
    with open(f'{folder_path}/{filename}.html', "w", encoding="utf-8") as html_file:
        html_file.write(raw_html)



def archive_queued_urls(num_urls_to_archive, counter_offset=0, actual_max=-1):
    actual_max = num_urls_to_archive if actual_max < 0 else actual_max
    # get articles to archive
    website_id = config.website_id_lookup[WEBSITE_NAME]
    urls_to_archive = db_manager.get_urls_to_archive(website_id, num_urls_to_archive)

    # and archive each one
    counter = 1
    for url in urls_to_archive:
        print(f'saving article {url["url"]}....[{counter + counter_offset}/{actual_max}]')
        
        # download webpage
        raw_html = get_html(url)
        
        # if None, something went wrong, just skip
        # if article != None:
        #     # save to filepath
        #     send_article_to_archive(article, raw_html)
            # and update its info in the DB
            # actually -- nothing to update for TIGSource
            # db_manager.update_article(article)

        # don't spam
        # time.sleep(random.uniform(0.7, 1.6))
        counter += 1

    # get list of articles that were succesfully archived
    urls_archived_successfully = []
    for url in urls_to_archive:
        if url['url'] not in ARTICLES_THAT_FAILED_TO_PARSE:
            urls_archived_successfully.append(url)
    
    # and mark as archived in the db
    # db_manager.mark_articles_as_archived(urls_archived_successfully)

    if len(ARTICLES_THAT_FAILED_TO_PARSE) > 0:
        print(f'*********************failed to parse the following articles: {",".join(ARTICLES_THAT_FAILED_TO_PARSE)}')



if __name__ == '__main__':
    # counter = 0
    # while counter < MAX_WEBSITES_TO_ARCHIVE:
    #     archive_queued_urls(BATCH_SIZE, counter, MAX_WEBSITES_TO_ARCHIVE)
    #     counter += BATCH_SIZE
    # print('done')

    url = {
        'id': 5,
        'url': 'https://www.n64.com/'
    }

    print(get_html(url))
