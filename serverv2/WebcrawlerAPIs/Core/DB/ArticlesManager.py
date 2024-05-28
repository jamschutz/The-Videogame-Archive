import logging
from datetime import datetime

from Core.Config import Config
from Core.Utils import Utils
from .DbManager import DbManager
from Entities.Article import Article


class ArticlesManager:

    def __init__(self):
        self.db = DbManager()




    # ==================================================================== #
    # ============    GET METHODS    ===================================== #
    # ==================================================================== #

    def get_articles_to_archive(self, num_articles_to_archive, website_id):
        query = f"""
            SELECT
                "Title", "DatePublished", "Url", "Id"
            FROM
                "Articles"
            WHERE
                "IsArchived" = false AND "WebsiteId" = {website_id} AND "Title" LIKE E'%''%'
            LIMIT
                {num_articles_to_archive}
        """

        results = self.db.get_query(query)
        articles = []
        for article in results:
            articles.append(Article(
                title = article[0],
                date = article[1],
                url = article[2],
                id = article[3]
            ))
        return articles
    

    def get_most_recent_article_date(self, website_id):
        query = f"""
            SELECT
                "DatePublished"
            FROM
                "Articles"
            WHERE
                "WebsiteId" = {website_id}
            ORDER BY
                "DatePublished"
            DESC
            LIMIT 1
        """

        return self.db.get_query(query)[0][0]




    # ==================================================================== #
    # ============    INSERT METHODS    ================================== #
    # ==================================================================== #

    def insert_articles(self, articles):
        # verify info looks correct
        for article in articles:
            if article.author == '' or article.url == ''      or article.type == '' or \
               article.title == ''  or article.subtitle == '' or article.website_id == None or \
               article.date == None:
                
                raise Exception("article is missing one of the following properties: author, url, type, title, subtitle, websiteid, date. bailing!")
            
        # otherwise, get author and url ids for each article
               




    # ==================================================================== #
    # ============    UPDATE METHODS    ================================== #
    # ==================================================================== #

    def mark_articles_as_archived(self, articles):
        ids = [str(a.id) for a in articles]
        query = f"""
            UPDATE
                "Articles"
            SET
                "IsArchived" = true
            WHERE
                "Id" IN ({','.join(ids)})
        """
        self.db.run_query(query)





if __name__ == '__main__':
    articles_manager = ArticlesManager()
    articles = articles_manager.get_articles_to_archive(10, 1)
    print([a.to_string() for a in articles])