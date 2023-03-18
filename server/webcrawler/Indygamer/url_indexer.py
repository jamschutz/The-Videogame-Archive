from server._shared.DbManager import DbManager
from server._shared.Config import Config
from server._shared.Utils import Utils

import json, time, random, requests
from pathlib import Path
from datetime import datetime
from bs4 import BeautifulSoup

BASE_URL = 'http://indygamer.blogspot.com/'
WEBSITE_NAME = 'Indygamer'
WEBSITE_ID = 6

DATETIME_FORMAT = '%A, %B %d, %Y'


db = DbManager()
config = Config()
utils = Utils()

# ================================= #
# == set these variables!!! ======= #
START_DATE = '2005/08'
END_DATE = '2008/01'
# ================================= #

def get_two_char_month_string(month):
    if(month < 10):
        return f'0{str(month)}'
    else:
        return str(month)


def get_links_from_page(date):
    # download webpage
    url = f'{BASE_URL}/{date}'
    source = requests.get(url).text
    soup = BeautifulSoup(source, 'lxml')

    articles = soup.find_all('div', class_='OnePost')

    article_data = []
    for article in articles:
        title  = article.find('div', class_='TitleHeaderPost').a.text.strip()
        if title == 'Previous Entries':
            continue

        url    = article.find('div', class_='TitleHeaderPost').a['href']
        author = article.find('div', class_='PermFooterPost').a.text.split(' by ')[-1].strip() # remove opening 'By: ' from text
        thumbnail = article.find('div', class_='PostTextBody').find('img')['src'] if article.find('div', class_='PostTextBody').find('img') != None else None
        # date time is in format: Weekday, Month Day, Year
        # we only care about the date, so split on the space and take only the first part
        date  = article.find('div', class_='DateHeaderPost').text.strip()

        # if date is empty, just set it to the last date
        if date == '':
            date = None
        else:
            date = datetime.strptime(date, DATETIME_FORMAT)

        # if thumbnail starts with '//', add 'https:' to the start
        if thumbnail != None and thumbnail[0:2] == '//':
            thumbnail = f'https:{thumbnail}'

        article_data.append({
            'title': title,
            'url': url,
            'date': date,
            'author': author,
            'website': WEBSITE_NAME
        })

        # if we have a thumbnail, tack it on
        if thumbnail != None:
            article_data[-1]['thumbnail'] = thumbnail

    # if any pages have null dates, just set to the nearest date
    for i in range(len(article_data)):
        if article_data[i]['date'] == None:
            for article in reversed(article_data[:i]):
                if article['date'] != None:
                    article_data[i]['date'] = article['date']
                    break
            
            if article_data[i]['date'] == None:
                for article in article_data[i+1:]:
                    if article['date'] != None:
                        article_data[i]['date'] = article['date']
                        break

    return article_data


def index_pages():
    articles = []
    start_year = int(START_DATE.split('/')[0])
    start_month = int(START_DATE.split('/')[1])
    end_year = int(END_DATE.split('/')[0])
    end_month = int(END_DATE.split('/')[1])

    year = start_year
    month = start_month
    while (year * 100 + month) <= (end_year * 100 + end_month):
        try:
            # get articles at page number
            print(f'fetching page {str(month)}/{str(year)}')
            article_links = get_links_from_page(f'{str(year)}/{get_two_char_month_string(month)}')

            # if we got here, proxy worked!
            articles.extend(article_links)
            
            month += 1
            if month > 12:
                month = 1
                year += 1

            # don't spam
            time.sleep(random.uniform(0.9, 2.1))
        except Exception as e:
            # bail on error
            print(f'{str(e)}\n\n----------something happened. bailing----------')
            break
    
    # sort by date
    articles = sorted(articles, key=lambda d: d['date']) 

    # for each article, convert datetime back to string (so it saves okay)
    for article in articles:
        article['date'] = article['date'].strftime('%m/%d/%Y')
        
        article['year']  = article['date'].split('/')[2]
        article['month'] = article['date'].split('/')[0]
        article['day']   = article['date'].split('/')[1]

        # build thumbnail filename...
        if 'thumbnail' in article:
            # if there's no file extension, just slap a .jpg on it
            day_2digits = utils.get_two_char_int_string(int(article['day']))
            thumbnail_file_extension = article['thumbnail'].split('.')[-1] if article['thumbnail'][-4] == '.' else '.jpg'
            article['thumbnail_filename'] = f"{config.url_to_filename(article['url'], day_2digits, WEBSITE_ID)}_thumbnail.{thumbnail_file_extension}"

            # and save the thumbnail
            if try_send_thumbnail_to_archive(article):
                "nothing more to do, it worked"
            else:
                # remove thumbnail_filename from article, so it doesn't get saved to the DB
                del article['thumbnail_filename']

    # save articles to database
    print('saving to db...')
    db.save_articles(articles)


def try_send_thumbnail_to_archive(article):
    month = utils.get_two_char_int_string(int(article['month']))
    year  = article['year']
    filepath = f'{config.ARCHIVE_FOLDER}/{WEBSITE_NAME}/_thumbnails/{year}/{month}'

    try:
        utils.save_thumbnail(article['thumbnail'], article['thumbnail_filename'], filepath)
        return True
    except:
        print(f'unable to save thumbnail for url: {article["url"]}')
        return False


def get_date(date):
    # and return it all together
    return datetime.strptime(date, DATETIME_FORMAT)



if __name__ == '__main__':
    index_pages()
    print('done')