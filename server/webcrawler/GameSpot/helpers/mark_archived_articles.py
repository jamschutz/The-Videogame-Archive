import sqlite3
from pathlib import Path

WEBSITE_NAME = 'GameSpot'
WEBSITE_ID = 1
FILE_STORAGE_PATH = f'/_website_backups/{WEBSITE_NAME}'
DATABASE_FILE = '/_database/VideogamesDatabase.db'


MAX_YEAR = 2000


def has_article_been_archived(article):
    year = article['year']
    url = article['url']
    month = article['month']
    day = article['day']

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

    return Path(f'{folder_path}/{filename}.html').exists()


def get_int_double_digit(n):
    n = int(n)
    if n >= 10:
        return n

    return f'0{str(n)}'


def get_db_query():
    query = f"SELECT MonthPublished, DayPublished, Url, YearPublished FROM Article WHERE YearPublished <= {MAX_YEAR} AND WebsiteId = {str(WEBSITE_ID)}"
    return query


def get_articles():
    # connect to db, and save
    db = sqlite3.connect(DATABASE_FILE)
    cursor = db.cursor()

    # execute script, save, and close
    query = get_db_query()    
    result = cursor.execute(query)
    articles = result.fetchall()
    db.close()

    articles_formatted = []
    for article in articles:
        articles_formatted.append({
            'month': get_int_double_digit(article[0]),
            'day': get_int_double_digit(article[1]),
            'url': article[2],
            'year': article[3]
        })

    return articles_formatted


def flag_archived_articles():
    all_articles_below_max_year = get_articles()

    archived_urls = []
    for article in all_articles_below_max_year:
        if(has_article_been_archived(article)):
            # wrap url in '' so it makes our IN clause easier below
            url = article['url']
            archived_urls.append(f"'{url}'")

    query = f"""
UPDATE 
	Article
SET
	IsArchived = 1
WHERE
	Url IN ({','.join(archived_urls)})
    """

    # connect to db, and save
    db = sqlite3.connect(DATABASE_FILE)
    cursor = db.cursor()

    # execute script, save, and close
    print(f'found {len(archived_urls)} that have been archived, updating...')
    result = cursor.execute(query)

    db.commit()
    db.close()
    print ('done')
    

flag_archived_articles()