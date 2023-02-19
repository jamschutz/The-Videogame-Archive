import web_scraper as ws
import json, time
from pathlib import Path
from datetime import datetime

BASE_URL = 'https://www.gamespot.com'
START_PAGE_NEWS = 4425
END_PAGE_NEWS   = 4425
DATETIME_FORMAT = '%A, %b %d, %Y %I:%M%p'
EXTEND_EXISTING = True

TEST_URL = 'https://www.gamespot.com/articles/miyamoto-talks-dolphin-at-space-world-99/1100-2323742/'


def save_sitemap():
    proxies = ws.get_free_proxies()
    sitemap = []

    page = START_PAGE_NEWS
    current_proxy = 0

    # build sitemap 1 by 1, rotating proxies as needed
    while current_proxy < len(proxies) and page >= END_PAGE_NEWS:
        try:
            # get articles at page number
            print(f'fetching page {str(page)}. proxies remaining: {str(len(proxies) - current_proxy)}')
            article_links = ws.get_links_from_news_page(page, proxies[current_proxy])

            # if we got here, proxy worked!
            sitemap.extend(article_links)
            page -= 1

            # don't spam
            time.sleep(1)
        except Exception as e:
            # get next proxy
            print(f'----------port {proxies[current_proxy]} is bad. trying next one----------')
            current_proxy += 1
    
    # save sitemap
    with open("../../archive/_sitemaps/GameSpot.json", "w") as json_file:
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