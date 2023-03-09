import pathlib
from bs4 import BeautifulSoup
import requests, json, time, random
from server._shared.Config import Config
from server._shared.DbManager import DbManager
from server._shared.Utils import Utils


#=============================================
# CHANGE THESE IF YOU COPY TO NEW FILE!!!!!!!!
WEBSITE_NAME = 'Gameplanet'
WEBSITE_ID = 3
# CHANGE THESE IF YOU COPY TO NEW FILE!!!!!!!!
#=============================================

MAX_WEBSITES_TO_ARCHIVE = 15000
BATCH_SIZE = 100

SUBTITLE_DIV_CLASS = 'abstract'
AUTHOR_DIV_CLASS = 'author'


# initialize helpers
config = Config()
db_manager = DbManager()
utils = Utils()

ARTICLES_THAT_FAILED_TO_PARSE = []


def get_thumbnail_url(soup):
    thumbnail_url = soup.find('div', id='gridSliceArticleTitleImage')

    # if no image, return None
    if(thumbnail_url == None):
        return None

    # otherwise, we want to turn something like this:
    #               https://url/article_title_large/img.jpg
    # into this:    https://url/feature_small/img.jpg
    # e.g.: replace 'article_title_large' with '/feature_small/'
    thumbnail_url = thumbnail_url.img['src']
    split_index = thumbnail_url.find('/article_title_large/')

    url_part1 = thumbnail_url[:split_index]
    url_part2 = thumbnail_url[split_index + len('/article_title_large/'):]

    return f'{url_part1}/feature_small/{url_part2}'



def get_article_data(article, raw_html):
    # parse html
    soup = BeautifulSoup(raw_html, 'lxml')

    try:
        # add info we need
        # not all articles have subtitles...
        article['subtitle'] = soup.find('h2', class_=SUBTITLE_DIV_CLASS)
        if article['subtitle'] == None:
            article['subtitle'] = ''
        else:
            article['subtitle'] = article['subtitle'].text.strip()

        article['author'] = soup.find('a', class_=AUTHOR_DIV_CLASS).text.strip()
        article['thumbnail_url'] = get_thumbnail_url(soup)

        return article

    except Exception as e:
        print(f'ERROR parsing: {article["title"]}: {str(e)}')
        if article['url'] not in ARTICLES_THAT_FAILED_TO_PARSE:
            ARTICLES_THAT_FAILED_TO_PARSE.append(article['url'])
        return None


    
def send_thumbnail_to_archive(article):
    thumbnail_url = article['thumbnail_url']
    # if no thumbnail, just bail
    if thumbnail_url == None:
        return

    article_url = article['url']
    month = utils.get_two_char_int_string(article['month'])
    day   = utils.get_two_char_int_string(article['day'])
    year  = article['year']

    # if there's no file extension, just slap a .jpg on it
    file_extension = thumbnail_url.split('.')[-1] if thumbnail_url[-4] == '.' else '.jpg'
    filename = f"{config.url_to_filename(article_url, day, WEBSITE_ID)}_thumbnail.{file_extension}"
    filepath = f'{config.ARCHIVE_FOLDER}/{WEBSITE_NAME}/_thumbnails/{year}/{month}'

    utils.save_thumbnail(thumbnail_url, filename, filepath)



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

    # and also save the thumbnail
    send_thumbnail_to_archive(article)



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
        print('(getting webpage...)')
        raw_html = requests.get(article['url']).text
        print('(done!)')

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
    print(f'*********************failed to parse the following articles: {",".join(ARTICLES_THAT_FAILED_TO_PARSE)}')



if __name__ == '__main__':
    counter = 0
    while counter < MAX_WEBSITES_TO_ARCHIVE:
        archive_queued_urls(BATCH_SIZE, counter, MAX_WEBSITES_TO_ARCHIVE)
        counter += BATCH_SIZE
    print('done')