import pathlib
from bs4 import BeautifulSoup
import requests, json, time, random
import sqlite3
from datetime import datetime


ARCHIVE_FOLDER_PATH = '../_archive/'
DATABASE_FILE = 'VideogamesDatabase.db'
DATETIME_FORMAT = '%m/%d/%Y'

START_YEAR = 1996
STOP_YEAR  = 1996


def website_name_to_id(website):
    if(website == 'GameSpot'):
        return 1
    if(website == 'Eurogamer'):
        return 2
    if(website == 'Gameplanet'):
        return 3

    print(f'ERROR!!!!!!!!!!!!! unknown website {website}')
    return None
    


def get_sql_insert_command(article):
    # parse the bits we need (for folder / filename)
    url = article['url']
    title = article['title'].replace("'", "''") # escape single quotes (' --> '')
    website = article['website']
    article_type = article['type'] if 'type' in article else None

    month = article['date'].split('/')[0]
    day   = article['date'].split('/')[1]
    year  = article['date'].split('/')[2]

    date_published_epoch = (datetime(int(year), int(month), int(day)) - datetime(1970, 1, 1)).total_seconds()

    # Title, Url, WebsiteId, DatePublished, Type, YearPublished, MonthPublished, DayPublished
    return f"('{title}', '{url}', {website_name_to_id(website)}, {date_published_epoch}, '{article_type}', {year}, {month}, {day})"


def get_total_articles(articles_for_year):
    total_count = 0
    for month in articles_for_year:
        for day in articles_for_year[month]:
            for article in articles_for_year[month][day]:
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
    

    sql_script = f"""
INSERT OR IGNORE INTO
    Article(Title, Url, WebsiteId, DatePublished, Type, YearPublished, MonthPublished, DayPublished)
VALUES
    """

    # sql_script += get_sql_insert_command(articles_for_year['05']['01'][0])

    # for each month.day entry...
    for month in articles_for_year:
        for day in articles_for_year[month]:
            for article in articles_for_year[month][day]:
                sql_script += f"{get_sql_insert_command(article)},\n"
                counter += 1

    # chop off trailing comma
    sql_script = sql_script[:-2]

    print('saving...')

    # connect to db, and save
    db = sqlite3.connect(DATABASE_FILE)
    cursor = db.cursor()

    # execute script, save, and close
    result = cursor.execute(sql_script)
    print(str(result.fetchall()))

    db.commit()
    db.close()

year = 2004
while year <= 2023:
    print(f'saving year {year}....')
    save_articles_for_year(year)
    year += 1

print('done')