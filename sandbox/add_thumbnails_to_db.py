import sqlite3, os
from pathlib import Path

TARGET_WEBSITE_NAME = 'Gameplanet'
TARGET_WEBISTE_ID = 3

def get_query(query):
    # connect to db, and fetch
    db = sqlite3.connect('/_database/VideogamesDatabase.db')
    cursor = db.cursor()
    result = cursor.execute(query)
    result = result.fetchall()
    db.close()

    return result


def run_query(query):
    # connect to db, and save
    db = sqlite3.connect('/_database/VideogamesDatabase.db')
    cursor = db.cursor()

    # execute script, save, and close
    cursor.execute(query)
    db.commit()
    db.close()


def url_to_filename(url, day):
    filename = ''
    if TARGET_WEBISTE_ID == 1:
        # convert https://example.com/something/TAKE_THIS_PART
        filename = f'{day}_{"_".join(url.split("/")[4:])}'
    else:
        # convert https://www.eurogamer.net/TAKE_THIS_PART
        filename = f'{day}_{"_".join(url.split("/")[3:])}'

    # if it has url parameters, remove them
    if '?' in filename:
        filename = filename[:filename.find('?')]

    # if ends in underscore, remove it
    if filename[-1] == '_':
        filename = filename[:-1]

    return filename


def get_two_char_int_string(n):
    if(n < 10):
        return f'0{str(n)}'
    else:
        return str(n)


def get_thumbnails_for_month(year, month):
    directory = f'/_website_backups/{TARGET_WEBSITE_NAME}/_thumbnails/{get_two_char_int_string(year)}/{get_two_char_int_string(month)}'
    try:
        files_in_dir = os.listdir(directory)
        return files_in_dir
    except:
        return []


def get_article_thumbnail(article, thumbnails):
    date = str(article['date'])
    year = date[:4]
    month = date[4:6]
    day = date[6:]

    target_filename = url_to_filename(article['url'], day) + '_thumbnail'
    for thumbnail in thumbnails:
        if target_filename in thumbnail:
            return thumbnail

    return None


def add_thumbnails_to_db(thumbnails):
    if(len(thumbnails)) == 0:
        return
    
    query = f"""
        INSERT OR IGNORE INTO
            Thumbnail(ArticleId, Filename)
        VALUES
            
    """
    for thumbnail in thumbnails:
        query += f"({thumbnail['article_id']}, '{thumbnail['filename']}'),\n"

    # chop off trailing comma
    query = query[:-2]
    run_query(query)





def get_articles(year, month):
    start = int(year) * 10000 + int(month) * 100
    end = start + 100
    query = f"""
        SELECT
            Id, Url, DatePublished
        FROM
            Article
        WHERE
            WebsiteId = {TARGET_WEBISTE_ID} AND DatePublished >= {start} AND DatePublished < {end}
    """
    result = get_query(query)

    articles = []
    for article in result:
        articles.append({
            'id': article[0],
            'url': article[1],
            'date': article[2]
        })

    return articles


start_year = 2000
end_year = 2020

year = start_year
while year <= end_year:
    for month in range(12):
        # convert [0,11] to [1,12]
        month = month + 1

        articles = get_articles(year, month)
        thumbnails = get_thumbnails_for_month(year, month)

        thumbnail_files = []
        for article in articles:
            filename = get_article_thumbnail(article, thumbnails)
            if filename != None:
                thumbnail_files.append({
                    'article_id': article['id'],
                    'filename': filename
                })

        print(f'sending {len(thumbnail_files)} files to db ({month}/{year})...')
        add_thumbnails_to_db(thumbnail_files)

    year += 1

