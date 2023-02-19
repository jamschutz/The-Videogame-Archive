import web_scraper as ws
import json

BASE_URL = 'https://www.gamespot.com'
START_PAGE_NEWS = 4425

TEST_URL = 'https://www.gamespot.com/articles/miyamoto-talks-dolphin-at-space-world-99/1100-2323742/'


def save_sitemap():
    proxies = ws.get_free_proxies()
    for proxy in proxies:
        try:
            article_links = ws.get_links_from_news_page(START_PAGE_NEWS, proxy)

            # if we got here, it was a success!
            print('success!')

            print(article_links)

            # save to file
            # with open("../../archive/sitemaps/GameSpot.json", "w") as text_file:
            #     text_file.write(article_links)

            with open("../../archive/sitemaps/GameSpot.json", "w") as json_file:
                json.dump(article_links, json_file)

            # stop searching with proxies
            break

        except:
            """ just keep trying proxies """
            print('trying next proxy...')


def save_wegpage(url):
    proxies = ws.get_free_proxies()
    for proxy in proxies:
        try:
            webpage = ws.get_webpage(url, proxy)

            # if we got here, it was a success!
            print('success!')

            # save to file
            with open("output.html", "w") as text_file:
                text_file.write(webpage)

            # stop searching with proxies
            break

        except:
            """ just keep trying proxies """
            print('trying next proxy...')


save_sitemap()
print('done')