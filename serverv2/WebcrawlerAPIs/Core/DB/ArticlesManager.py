import logging
from datetime import datetime

from Core.Config import Config
from Core.Utils import Utils
from .DbManager import DbManager
from .WritersManager import WritersManager
from .ArticleTypesManager import ArticleTypesManager
from .TagsManager import TagsManager
from Entities.Article import Article


class ArticlesManager:

    def __init__(self):
        self.db = DbManager()
        self.writers = WritersManager()
        self.article_types = ArticleTypesManager()




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
               article.title == ''or article.website_id == None or article.date == None:
                
                raise Exception("article is missing one of the following properties: author, url, type, title, websiteid, date. bailing!")
            
        # remove articles that already exist in db (ignore duplicates)
        existing_articles = self.__get_existing_article_urls(articles)
        articles_to_insert = []
        urls_added = set()
        for a in articles:
            if a.url not in existing_articles and a.url not in urls_added:
                articles_to_insert.append(a)
                urls_added.add(a.url)
        
        # if no articles to insert ,just return
        if len(articles_to_insert) == 0:
            return
            
        # otherwise, get author and url ids for each article
        author_ids = self.writers.get_writers_and_create_if_not_exist(articles_to_insert)
        type_ids = self.article_types.get_article_types_and_create_if_not_exist(articles_to_insert)

        # inject ids into article data, and format title / subtitle, etc
        articles_to_insert = self.__prep_articles_for_insertion(articles_to_insert, author_ids, type_ids)

        # build query
        articles_formatted = [
            f"('{a.title}', '{a.subtitle}', '{a.url}', {a.author_id}, {a.website_id}, {a.date}, {a.type_id}, {a.thumbnail if a.thumbnail is not None else 'NULL'}, false)"
            for a in articles_to_insert
        ]
        query = f"""
            INSERT INTO "Articles"
                ("Title", "Subtitle", "Url", "AuthorId", "WebsiteId", "DatePublished", "ArticleTypeId", "Thumbnail", "IsArchived")
            VALUES
                {','.join(articles_formatted)}
        """

        # and run
        self.db.run_query(query)




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




    # ==================================================================== #
    # ============    HELPER METHODS    ================================== #
    # ==================================================================== #

    def __get_existing_article_urls(self, articles):
        urls = [f"'{a.url}'" for a in articles]
        query = f"""
            SELECT
                "Url"
            FROM
                "Articles"
            WHERE
                "Url" IN ({','.join(urls)})
        """
        results = self.db.get_query(query)

        existing_urls = set()
        for url in results:
            existing_urls.add(url[0])

        return existing_urls
    

    def __prep_articles_for_insertion(self, articles, author_id_lookup, type_id_lookup):
        # inject ids into article data
        for article in articles:
            article.author_id = author_id_lookup[article.author]
            article.type_id = type_id_lookup[article.type]

            # clean up title and subtitle
            article.title = article.title.replace("'", "''")
            article.subtitle = article.subtitle.replace("'", "''")

            # if subtitle is too long, just truncate and slap an ellipses on it
            if len(article.subtitle) > 250:
                truncate_index = 246

                # if we're truncating an apostophe, it will cause string parsing issues...back up until we're safe
                while article.subtitle[truncate_index] == "'":
                    truncate_index -= 1

                # and truncate
                article.subtitle = f"{article.subtitle[:truncate_index]}..."

        return articles





if __name__ == '__main__':
    articles_manager = ArticlesManager()

    articles = [
        Article(
            title="The Abrupt Goodbye",
            subtitle='',
            author='Tim',
            website_id=6,
            date=20071018,
            type='UNKNOWN',
            url="http://indygamer.blogspot.com/2007/10/abrupt-goodbye.html"
        ),
        Article(
            title="European Promotion Tournament recap",
            subtitle='',
            author='UNKNOWN',
            website_id=1,
            date=20131218,
            type='news',
            url="https://www.gamespot.com/articles/european-promotion-tournament-recap/1100-6436643/"
        ),
        Article(
            title='testing article',
            subtitle='',
            author='UNKNOWN',
            website_id=1,
            date=20240529,
            type='news',
            url="www.dummyurl.com"
        ),
        Article(
            title='testing article',
            subtitle='',
            author='UNKNOWN',
            website_id=1,
            date=20240529,
            type='news',
            url="www.dummyurl.com"
        )
    ]
    articles = articles_manager.insert_articles(articles)
    print(articles)