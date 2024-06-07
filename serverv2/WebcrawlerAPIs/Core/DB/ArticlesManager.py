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
        self.utils = Utils()




    # ==================================================================== #
    # ============    GET METHODS    ===================================== #
    # ==================================================================== #

    def get_articles_to_archive(self, num_articles_to_archive, website_id):
        query = f"""
            SELECT
                "Title", "DatePublished", "Url", "Id", "Thumbnail"
            FROM
                "Articles"
            WHERE
                "IsArchived" = false AND "WebsiteId" = {website_id}
            ORDER BY
                "DatePublished"
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
                id = article[3],
                thumbnail_url=article[4]
            ))
        return articles
    

    def get_num_articles_to_archive(self, website_id):
        query = f"""
            SELECT
                COUNT(*)
            FROM
                "Articles"
            WHERE
                "IsArchived" = false AND "WebsiteId" = {website_id}
        """

        return self.db.get_query(query)[0][0]
    

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
        # # verify info looks correct
        # for article in articles:
        #     if article.author == '' or article.url == ''      or article.type == '' or \
        #        article.title == ''or article.website_id == None or article.date == None:
                
        #         raise Exception("article is missing one of the following properties: author, url, type, title, websiteid, date. bailing!")
            
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
            f"('{a.title}', '{a.subtitle}', '{a.url}', {a.author_id}, {a.website_id}, {a.date}, {a.type_id}, {a.thumbnail_filename if a.thumbnail_filename is not None else 'NULL'}, false)"
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


    def update_article(self, article):
        # inject db data
        if article.thumbnail_filename is None and article.thumbnail_url is not None:
            article.thumbnail_filename = self.utils.get_thumbnail_filename(article)
        if article.author_id is None and article.author != '':
            article.author_id = self.writers.get_writer_and_create_if_not_exists(article.author)
        if article.type_id is None:
            article.type_id = self.article_types.get_article_type_and_create_if_not_exists(article.type)

        # clean up title and subtitle
        article.update_title_and_subtitle_for_sql()

        # build query base
        query = f"""
            UPDATE
                "Articles"
            SET

        """

        # and add to query as needed, depending on what data is in the article
        query += f"\"Title\" = '{article.title}', " if article.title != '' else ''
        query += f"\"Subtitle\" = '{article.subtitle}', " if article.subtitle != '' else ''
        query += f"\"AuthorId\" = {article.author_id}, " if article.author_id is not None else ''
        query += f"\"DatePublished\" = {article.date}, " if article.date != None else ''
        query += f"\"Thumbnail\" = '{article.thumbnail_filename}', " if article.thumbnail_filename is not None and article.thumbnail_filename != '' else ''
        query += f"\"ArticleTypeId\" = {article.type_id}, " if article.type_id > 0 else ''
        
        # delete closing comma, and run
        if query[-2:] == ', ':
            query = query[:-2]

        query += f"""
            WHERE
                "Url" = '{article.url}'
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

            # update data for sql (i.e. change ' to '', truncate subtitle if needed, etc)
            article.update_title_and_subtitle_for_sql()

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
    articles_manager.insert_articles(articles)
    
    test = articles[-1]
    test.author = "Eden"
    test.thumbnail_url = 'https://www.gamespot.com/a/uploads/screen_petite/1837/18375603/4309990-leagueoflegends.jpg'
    articles_manager.update_article(test)