import web_scraper as ws
import json

BASE_URL = 'https://www.gamespot.com'
START_PAGE_NEWS = 4425

TEST_URL = 'https://www.gamespot.com/articles/miyamoto-talks-dolphin-at-space-world-99/1100-2323742/'


def get_article_links(page_number, proxies):
    while len(proxies) > 0:
        try:
            article_links = ws.get_links_from_news_page(START_PAGE_NEWS, proxies[0])
            return article_links

        except Exception as e:
            """ just keep trying proxies """
            print(f'{str(e)}\n\n----------trying next proxy...----------')
            proxies.pop()

            if(len(proxies) == 0):
                print('------------------OUT OF PROXIES!!!----------------')
                return


def save_sitemap():
    proxies = ws.get_free_proxies()
    sitemap = []
    sitemap.extend(get_article_links(START_PAGE_NEWS, proxies))
    
    with open("../../archive/sitemaps/GameSpot.json", "w") as json_file:
        json.dump(sitemap, json_file)


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