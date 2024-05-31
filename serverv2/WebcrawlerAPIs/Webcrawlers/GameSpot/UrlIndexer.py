from Core.Config import Config
from Core.Utils import Utils
from Core.DB.ArticlesManager import ArticlesManager
from Core.DB.WebsitesManager import WebsitesManager
from .helpers.web_scraper import get_links

from pathlib import Path
from datetime import datetime
import logging



class UrlIndexerGameSpot:
    
    def __init__(self):
        self.website_name = 'GameSpot'
        self.articles_manager = ArticlesManager()
        self.config = Config()
        self.utils = Utils()

        self.website_id = WebsitesManager().get_id(self.website_name)


    def index_target_months(self):
        # get most recent logged article
        last_archived_article_date = self.articles_manager.get_most_recent_article_date(self.website_id)

        # get actual articles from site
        news_articles = self.__get_articles_after_date('news', last_archived_article_date)
        reviews_articles = self.__get_articles_after_date('games/reviews', last_archived_article_date)

        # assign types
        for article in news_articles:
            article.type = 'news'
        for article in reviews_articles:
            article.type = 'review'

        # build full list of articles
        articles = []
        articles.extend(news_articles)
        articles.extend(reviews_articles)        

        # add / clean up fields
        for article in articles:
            article.website_id = self.website_id
            article.date = str(self.utils.date_to_num(article.date))
            # we will get the actual values for these when we archive them -- for now, just put down whatever so we can insert non-null values into the db!
            article.author = self.config.PLACEHOLDER_AUTHOR_NAME
            article.subtitle = ''
            # we'll download this and replace with the actual thumbnail filename during the archive step...
            article.thumbnail_filename = f"'{article.thumbnail_url}'"

        # save articles to database in batches of 1000 at a time
        offset = 0
        while offset < len(articles):
            print(f'saving articles {offset}/{len(articles)}')
            logging.info(f'saving articles {offset}/{len(articles)}')
            batch = articles[offset:offset + 999]
            self.articles_manager.insert_articles(batch)
            offset += 1000

        print('done')


    def __get_articles_after_date(self, target_page, target_date):
        articles = []
        page = 1

        while True:
            try:
                # get articles at page number
                logging.info(f'fetching {target_page}, page {page}')
                print(f'fetching {target_page}, page {page}')
                article_links = get_links(page, target_page)

                # add articles on page to global list
                articles.extend(article_links)

                # if any of the article's dates are older than our last archived date, break
                if any(self.utils.date_to_num(a.date) < target_date for a in article_links):
                    return articles

                page += 1

            except Exception as e:
                # show error
                logging.info(f'{str(e)}\n\n-------------------------unable to get archive month for GameSpot----------------')
                print(f'{str(e)}\n\n-------------------------unable to get archive month for GameSpot----------------')
                return articles


    



if __name__ == '__main__':
    indexer = UrlIndexerGameSpot()
    indexer.index_target_months()