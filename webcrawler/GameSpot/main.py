import web_scraper as ws
import json, time
from pathlib import Path
from datetime import datetime
import random

BASE_URL = 'https://www.gamespot.com'
NEWS_URL = 'news/'
REVIEWS_URL = 'games/reviews/'
START_PAGE_NEWS = 1450
END_PAGE_NEWS   = 500

START_PAGE_REVIEWS = 550
END_PAGE_REVIEWS = 449

DATETIME_FORMAT = '%A, %b %d, %Y %I:%M%p'
EXTEND_EXISTING = True

TEST_URL = 'https://www.gamespot.com/articles/miyamoto-talks-dolphin-at-space-world-99/1100-2323742/'


def save_sitemap():
    proxies = ws.get_free_proxies()
    sitemap = []

    page = START_PAGE_NEWS
    current_proxy = 0
    consecutive_bad_proxy_attempts = 0

    # build sitemap 1 by 1, rotating proxies as needed
    while current_proxy < len(proxies) and page >= END_PAGE_NEWS:
        try:
            # get articles at page number
            print(f'fetching page {str(page)}. proxies remaining: {str(len(proxies) - current_proxy)}')
            article_links = ws.get_links_from_news_page(page, proxies[current_proxy], target_page=NEWS_URL, use_proxy=False)

            # if we got here, proxy worked!
            sitemap.extend(article_links)
            page -= 1
            consecutive_bad_proxy_attempts = 0

            # don't spam
            time.sleep(random.uniform(0.9, 2.1))
        except Exception as e:
            # get next proxy
            print(f'{str(e)}\n\n----------port {proxies[current_proxy]} is bad. trying next one----------')
            current_proxy += 1
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
# proxies = ws.get_free_proxies()
print('done')