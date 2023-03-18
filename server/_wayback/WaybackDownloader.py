import pathlib
from bs4 import BeautifulSoup
import requests, json, time, random
from server._shared.Config import Config
from server._wayback.WaybackDbManager import WaybackDbManager
from server._shared.Utils import Utils
from server._shared.Archiver import Archiver


BASE_URL = 'https://www.n64.com'
WEBSITE_NAME = 'N64.com'
WEBSITE_ID = 7
MAX_WEBSITES_TO_ARCHIVE = 10
BATCH_SIZE = 10


# initialize helpers
config = Config()
db_manager = WaybackDbManager()
utils = Utils()
archiver = Archiver()

ARTICLES_THAT_FAILED_TO_PARSE = []


def html_has_no_content(html):
    soup = BeautifulSoup(html, 'lxml')
    return soup.text.strip() == ''


def get_earliest_snapshot(url):
    # get all snapshot for this url -- they'll be sorted earliest to latest
    snapshots = db_manager.get_url_snapshots(url['id'], WEBSITE_ID)

    counter = 1
    for snapshot in snapshots:
        # grab date info from timestamp
        timestamp = str(snapshot['timestamp'])
        year  = timestamp[:4]
        month = timestamp[4:6]
        day   = timestamp[6:8]

        # http://web.archive.org/web/20000129130354/www.n64.com/codes/doom/intro/doom64.pdf
        wayback_url = f'http://web.archive.org/web/{snapshot["timestamp"]}/{snapshot["url"]}'

        try:
            # download from wayback
            raw_html = requests.get(wayback_url).text

            # if html empty, try next snapshot
            if html_has_no_content(raw_html):
                raise Exception("url has no content")

            # and download css and images
            raw_html = archiver.inject_css(raw_html, 'https://web.archive.org', WEBSITE_NAME, year, month, day, url['url'])
            # and return
            return {
                'html': raw_html,
                'snapshot': snapshot
            }
        except Exception as e:
            # if something goes wrong, just try next snapshot
            print(f'bad snapshot, trying next one ({counter} of {len(snapshots)})\n{str(e)}')

            counter += 1
            continue

    # no good snapshots, return none
    return None



def send_article_to_archive(url, snapshot, raw_html):
    # reset articles failed to parse
    ARTICLES_THAT_FAILED_TO_PARSE = []

    # parse the bits we need (for folder / filename)
    url = url['url']
    timestamp = str(snapshot['timestamp'])
    year  = timestamp[:4]
    month = timestamp[4:6]
    day   = timestamp[6:8]

    # set target folder and filename
    folder_path = f'{config.ARCHIVE_FOLDER}/{WEBSITE_NAME}/{year}/{month}'
    filename = config.url_to_filename(url, day, WEBSITE_ID)

    # make sure folder path exists
    pathlib.Path(folder_path).mkdir(parents=True, exist_ok=True)

    # and save
    with open(f'{folder_path}/{filename}_wayback.html', "w", encoding="utf-8") as html_file:
        html_file.write(raw_html)



def archive_queued_urls(num_urls_to_archive, counter_offset=0, actual_max=-1):
    actual_max = num_urls_to_archive if actual_max < 0 else actual_max
    # get articles to archive
    website_id = config.website_id_lookup[WEBSITE_NAME]
    urls_to_archive = db_manager.get_urls_to_archive(WEBSITE_ID, num_urls_to_archive)

    print(f'found {len(urls_to_archive)} urls to archive')

    # and archive each one
    counter = 1
    for url in urls_to_archive:
        print(f'saving article {url["url"]}....[{counter + counter_offset}/{actual_max}]')
        
        try:
            # download webpage
            snapshot = get_earliest_snapshot(url)

            # unable to find a valid snapshot
            if snapshot == None:
                raise Exception("no good snapshot found")
        
            # save to filepath
            send_article_to_archive(url, snapshot['snapshot'], snapshot['html'])
        except Exception as e:
            print(f'error downloading {url["url"]}...skipping!\n\n{str(e)}')
            ARTICLES_THAT_FAILED_TO_PARSE.append(url['url'])

        # increase counter
        counter += 1

    # get list of articles that were succesfully archived
    urls_archived_successfully = []
    for url in urls_to_archive:
        if url['url'] not in ARTICLES_THAT_FAILED_TO_PARSE:
            urls_archived_successfully.append(url)
    
    # and mark as archived in the db
    db_manager.mark_urls_as_archived(urls_archived_successfully)

    if len(ARTICLES_THAT_FAILED_TO_PARSE) > 0:
        print(f'*********************failed to parse the following articles: {",".join(ARTICLES_THAT_FAILED_TO_PARSE)}')



if __name__ == '__main__':
    counter = 0
    while counter < MAX_WEBSITES_TO_ARCHIVE:
        archive_queued_urls(BATCH_SIZE, counter, MAX_WEBSITES_TO_ARCHIVE)
        counter += BATCH_SIZE
    print('done')

    # url = {
    #     'id': 5,
    #     'url': 'https://www.n64.com/'
    # }

    # print(get_earliest_snapshot(url))

    # # print(get_html(url))
    # archive_queued_urls(1, 0)
    # # print(db_manager.get_urls_to_archive(WEBSITE_ID, 1))
