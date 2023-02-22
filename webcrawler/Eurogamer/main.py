import web_scraper as ws
import json, time
from pathlib import Path
from datetime import datetime
import random
from utils import get_next_month

BASE_URL = 'https://www.eurogamer.net/archive'
START_DATE   = '1999/09'
STOP_AT_DATE = '1999/10'

DATETIME_FORMAT = '%A, %b %d, %Y %I:%M%p'


def save_sitemap():
    proxies = ws.get_free_proxies()
    sitemap = []

    current_date = START_DATE
    consecutive_bad_proxy_attempts = 0

    # build sitemap 1 by 1, rotating proxies as needed
    while current_date != STOP_AT_DATE:
        try:
            # get articles at page number
            print(f'fetching date {current_date}. bad attemps: {consecutive_bad_proxy_attempts}')
            article_links = ws.get_links_from_archive_month(month='09', year='1999')

            # if we got here, proxy worked!
            sitemap.extend(article_links)
            current_date = get_next_month(current_date)
            consecutive_bad_proxy_attempts = 0

            # don't spam
            time.sleep(random.uniform(0.9, 2.1))
        except Exception as e:
            # get next proxy
            print(f'{str(e)}\n\n----------got bad attempt, retrying----------')
            consecutive_bad_proxy_attempts += 1

            # if we keep getting bad proxies, just bail
            if consecutive_bad_proxy_attempts > 30:
                break
            time.sleep(random.uniform(0.9, 2.1))
    
    # sort by date
    sitemap = sorted(sitemap, key=lambda d: d['date']) 

    # for each article, convert datetime back to string (so it saves okay)
    for article in sitemap:
        article['date'] = article['date'].strftime('%m/%d/%Y')

    # save sitemap
    with open("../../data/_dumps/temp.json", "w") as json_file:
        json.dump(sitemap, json_file)


def save_wegpage(url, date, title):
    proxies = ws.get_free_proxies()

    # parse year / month / day from date
    date_dt = datetime.strptime(date, DATETIME_FORMAT)
    year = date_dt.strftime("%Y")
    month = date_dt.strftime('%m')
    day = date_dt.strftime('%d')

    # build folder path
    folder_path = f'../../archive/{str(year)}/{str(month)}'
    filename = f'GameSpot_{str(day)}-{str(month)}-{str(year)}_{title}.html'

    # grab webpage
    for proxy in proxies:
        try:
            webpage = ws.get_webpage(url, proxy)

            # if we got here, it was a success!
            print('success!')

            # save to file
            Path(folder_path).mkdir(parents=True, exist_ok=True) # ensure folder exists
            with open(f'{folder_path}/{filename}', "w") as html_file:
                html_file.write(webpage)

            # stop searching with proxies
            break

        except:
            """ just keep trying proxies """
            print('trying next proxy...')


save_sitemap()
print('done')