import pathlib
from bs4 import BeautifulSoup
import requests, json, time, random
from server._shared.Config import Config
from server._shared.DbManager import DbManager
from server._shared.Utils import Utils


WEBSITE_NAME = 'Eurogamer'
WEBSITE_ID = 2
MAX_WEBSITES_TO_ARCHIVE = 3000
BATCH_SIZE = 500

SUBTITLE_DIV_CLASS = 'synopsis'
AUTHOR_DIV_CLASS = 'author'
ARTICLE_TYPE_DIV_CLASS = 'article_type'


# initialize helpers
config = Config()
db_manager = DbManager()
utils = Utils()

ARTICLES_THAT_FAILED_TO_PARSE = []


def get_thumbnail_url(soup):
    thumbnail_url = soup.find('img', class_='headline_image')

    # if no image, return Eurogamer's placeholder
    if(thumbnail_url == None):
        return 'https://www.eurogamer.net/static/img/placeholder.png'

    # otherwise, we want to turn something like this:
    #               https://img.jpg/resize/690%3E/format/jpg/img.jpg
    # into this:    https://img.jpg/thumbnail/384x216/format/jpg/img.jpg
    # e.g.: replace '/resize/690%30E/' with '/thumbnail/384x216/'
    thumbnail_url = thumbnail_url['src']
    split_index = thumbnail_url.find('/resize/690%3E/')

    url_part1 = thumbnail_url[:split_index]
    url_part2 = thumbnail_url[split_index + len('/resize/690%30E/') - 1:]

    return f'{url_part1}/thumbnail/384x216/{url_part2}'



def get_article_data(article, raw_html):
    # parse html
    soup = BeautifulSoup(raw_html, 'lxml')

    try:
        # add info we need
        # not all articles have subtitles...
        article['subtitle'] = soup.find('section', class_=SUBTITLE_DIV_CLASS)
        if article['subtitle'] == None:
            article['subtitle'] = ''
        else:
            article['subtitle'] = article['subtitle'].text.strip()

        article['author'] = soup.find('div', class_=AUTHOR_DIV_CLASS).find('span', class_='name').a.text.strip()
        article['type'] = soup.find('span', class_=ARTICLE_TYPE_DIV_CLASS).text.strip().lower()
        article['thumbnail_url'] = get_thumbnail_url(soup)

        return article

        # save to db
        # db_manager.update_article(article)
    except Exception as e:
        print(f'ERROR parsing: {article["title"]}: {str(e)}')
        if article['url'] not in ARTICLES_THAT_FAILED_TO_PARSE:
            ARTICLES_THAT_FAILED_TO_PARSE.append(article['url'])
        return None


    
def send_thumbnail_to_archive(article):
    thumbnail_url = article['thumbnail_url']
    article_url = article['url']
    month = utils.get_two_char_int_string(article['month'])
    day   = utils.get_two_char_int_string(article['day'])
    year  = article['year']

    # if there's no file extension, just slap a .jpg on it
    file_extension = thumbnail_url.split('.')[-1] if thumbnail_url[-4] == '.' else '.jpg'
    filename = f"{config.url_to_filename(article_url, day, WEBSITE_ID)}_thumbnail.{file_extension}"
    filepath = f'{config.ARCHIVE_FOLDER}/Eurogamer/_thumbnails/{year}/{month}'

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
        raw_html = requests.get(article['url']).text

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
    while counter <= MAX_WEBSITES_TO_ARCHIVE:
        archive_queued_urls(BATCH_SIZE, counter, MAX_WEBSITES_TO_ARCHIVE)
        counter += BATCH_SIZE
    print('done')