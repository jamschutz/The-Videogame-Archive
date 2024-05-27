import psycopg2
import logging
from datetime import datetime

from Core.Config import Config
from Core.Utils import Utils
from .DbManager import DbManager


class ArticlesManager:

    def __init__(self):
        self.db = DbManager()


    def get_articles_to_archive(self, num_articles_to_archive, website_id):
        query = f"""
            SELECT
                "Title", "DatePublished", "Url", "Id"
            FROM
                "Articles"
            WHERE
                "IsArchived" = false AND "WebsiteId" = {website_id}
            LIMIT
                {num_articles_to_archive}
        """

        results = self.db.get_query(query)
        return results





if __name__ == '__main__':
    articles_manager = ArticlesManager()
    articles = articles_manager.get_articles_to_archive(10, 1)
    print(articles)