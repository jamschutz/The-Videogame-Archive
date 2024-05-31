from Core.Config import Config
from Core.Utils import Utils
from Entities.Article import Article
from Core.DB.ArticlesManager import ArticlesManager
from Core.DB.WebsitesManager import WebsitesManager
from ..Eurogamer.helpers.utils import get_next_month, get_article_date

import logging
import requests
from datetime import datetime
from bs4 import BeautifulSoup



class UrlIndexerRockPaperShotgun:
    
    def __init__(self):
        self.website_name = 'Rock Paper Shotgun'
        self.articles_manager = ArticlesManager()
        self.config = Config()
        self.utils = Utils()

        self.website_id = WebsitesManager().get_id(self.website_name)


    def index_target_months(self):
        # get most recent logged article
        start_date = str(self.articles_manager.get_most_recent_article_date(self.website_id))

        # convert YYYYMMDD format to YYYY/MM format
        current_date = f'{start_date[0:4]}/{start_date[4:6]}'
        stop_at_date = datetime.utcnow().strftime('%Y/%m')

        articles = []
        while True:
            try:
                # get articles at page number
                logging.info(f'fetching date {current_date}.')
                print(f'fetching date {current_date}.')
                m = current_date.split('/')[1]
                y = current_date.split('/')[0]
                article_links = self.get_links_from_archive_month(month=m, year=y, website_id=self.website_id)

                # if we got here, proxy worked!
                articles.extend(article_links)
            except Exception as e:
                # show error
                logging.info(f'{str(e)}\n\n----------unable to get archive month----------')
                print(f'{str(e)}\n\n----------unable to get archive month----------')
                return

            # add / clean up fields
            for article in articles:
                # we will get the actual values for these when we archive them -- for now, just put down whatever so we can insert non-null values into the db!
                article.author = self.config.PLACEHOLDER_AUTHOR_NAME
                article.type = 'news'
                article.subtitle = ''

            # # save articles to database
            # self.articles_manager.insert_articles(articles)

            # if we just got the last date, we can stop
            if current_date == stop_at_date:
                return

            # otherwise, go to the next month
            current_date = get_next_month(current_date)


    def get_links_from_archive_month(self, month, year):
        # download webpage
        url = f'https://www.rockpapershotgun.com/archive/{year}/{month}'
        source = requests.get(url).text
        soup = BeautifulSoup(source, 'lxml')

        day_archives = soup.find('div', class_='archive_by_date_items').ol.find_all('li', recursive=False)

        article_data = []
        for day_archive in day_archives:
            date = day_archive.div.time['datetime']
            articles_on_day = day_archive.ol.find_all('li')

            for article in articles_on_day:
                article_title = article.a.text.strip()
                article_url   = article.a['href']

                # bad link! ignore
                if not article_url.startswith('https://www.rockpapershotgun.com'):
                    continue

                # convert to datetime
                article_date = datetime.strptime(date, '%Y-%m-%d')

                article_data.append(Article(
                    title = article_title,
                    url = article_url,
                    date = get_article_date(article_date),
                    website_id = self.website_id
                ))

        return article_data



if __name__ == '__main__':
    rps = UrlIndexerRockPaperShotgun()
    config = Config()
    articles_manager = ArticlesManager()

    # let's just seed the itial articles...
    articles = rps.get_links_from_archive_month('07', '2007')

    # add / clean up fields
    for article in articles:
        # we will get the actual values for these when we archive them -- for now, just put down whatever so we can insert non-null values into the db!
        article.author = config.PLACEHOLDER_AUTHOR_NAME
        article.type = 'news'
        article.subtitle = ''

    articles_manager.insert_articles(articles)