import pathlib
from bs4 import BeautifulSoup
import requests, json, time, random
from server._shared.Config import Config
from server._shared.DbManager import DbManager
from server._shared.Utils import Utils


BASE_URL = 'https://jayisgames.com'
WEBSITE_NAME = 'JayIsGames'
WEBSITE_ID = 4
MAX_WEBSITES_TO_ARCHIVE = 12000
BATCH_SIZE = 500

AUTHOR_DIV_CLASS = 'author'
ARTICLE_TYPE_DIV_CLASS = 'article_type'


# initialize helpers
config = Config()
db_manager = DbManager()
utils = Utils()

ARTICLES_THAT_FAILED_TO_PARSE = []


def get_html(url):
    # return soup
    raw_html = requests.get(url).text
    raw_html = utils.inject_css(raw_html, BASE_URL)
    return raw_html



def get_article_data(article, raw_html):
    # parse html
    soup = BeautifulSoup(raw_html, 'lxml')

    try:
        # no subtitles on this site
        article['subtitle'] = ''
        # parse author info from "By AUTHOR_NAME | Date"
        author = soup.find('div', class_='entrydate').text.split('|')[0].strip()
        # remove "By " at the start
        author = author[len('By '):]

        article['author'] = author
        return article

    except Exception as e:
        print(f'ERROR parsing: {article["title"]}: {str(e)}')
        if article['url'] not in ARTICLES_THAT_FAILED_TO_PARSE:
            ARTICLES_THAT_FAILED_TO_PARSE.append(article['url'])
        return None



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
    articles_to_archive = db_manager.get_urls_to_archive(num_urls_to_archive, website_id)

    # and archive each one
    counter = 1
    for article in articles_to_archive:
        print(f'saving article {article["title"]} ({article["month"]}/{article["day"]}/{article["year"]})....[{counter + counter_offset}/{actual_max}]')
        
        # download webpage
        raw_html = get_html(article['url'])

        # get article data
        article = get_article_data(article, raw_html)
        
        # if None, something went wrong, just skip
        if article != None:
            # save to filepath
            send_article_to_archive(article, raw_html)
            # and update its info in the DB
            db_manager.update_article(article)

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

    if len(ARTICLES_THAT_FAILED_TO_PARSE) > 0:
        print(f'*********************failed to parse the following articles: {",".join(ARTICLES_THAT_FAILED_TO_PARSE)}')



if __name__ == '__main__':
    counter = 0
    while counter < MAX_WEBSITES_TO_ARCHIVE:
        archive_queued_urls(BATCH_SIZE, counter, MAX_WEBSITES_TO_ARCHIVE)
        counter += BATCH_SIZE
    print('done')
