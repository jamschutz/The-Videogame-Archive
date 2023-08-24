import sqlite3, pyodbc
from datetime import datetime
from .._shared.Config import Config
from .._shared.Secrets import Secrets

class AzureDbManager:
    def __init__(self):
        self.config = Config()
        self.secrets = Secrets()

        self.connection_string = 'DRIVER='+self.secrets.SQL_DRIVER+';SERVER=tcp:'+self.secrets.SQL_SERVER_NAME+';PORT=1433;DATABASE='+self.secrets.SQL_DB_NAME+';UID='+self.secrets.SQL_SERVER_ADMIN_USER+';PWD='+ self.secrets.SQL_SERVER_ADMIN_PASSWORD
        # self.connection_string = (
        #     r'Driver={SQL SERVER};'
        #     f'Server={self.secrets.SQL_SERVER_NAME};'
        #     f'Database'
        # )


    def run_query(self, query):
        with pyodbc.connect(self.connection_string) as conn:
            with conn.cursor() as cursor:
                cursor.execute(query)


    def get_query(self, query):
        result = []
        with pyodbc.connect(self.connection_string) as conn:
            with conn.cursor() as cursor:
                cursor.execute(query)
                result = cursor.fetchall()

        return result



    def insert_writers(self, writers):
        # wrap writer names in ('NAME')
        writers_formatted = []
        for writer in writers:
            writer = writer.replace("'", "''")
            writers_formatted.append(f"('{writer}')")

        # build query
        query = f"""
            INSERT INTO Writer
                (Name)
            VALUES
                {','.join(writers_formatted)};
        """

        # and run
        self.run_query(query)



    def insert_publications(self, publications):
        # wrap writer names in ('NAME')
        publications_formatted = []
        for publication in publications:
            year_ended = publication['year_ended'] if publication['year_ended'] != None else 'null'
            publications_formatted.append(f"('{publication['name']}', null, {publication['year_started']}, {year_ended}, '{publication['url']}', '{publication['country']}', {publication['is_active']}, 1)")

        # build query
        query = f"""
            INSERT INTO Publication
                (Name, Founders, YearStarted, YearEnded, Url, Country, IsActive, TypeId)
            VALUES
                {','.join(publications_formatted)}
        """
        print(query)

        # and run
        self.run_query(query)


    def insert_article_urls(self, urls):
        # wrap urls in ('URL')
        urls_formatted = []
        for url in urls:
            url = url.replace("'", "''")
            urls_formatted.append(f"('{url}')")

        # build query
        query = f"""
            INSERT INTO ArticleUrl
                (Url)
            VALUES
                {','.join(urls_formatted)};
        """

        # and run
        self.run_query(query)


    def insert_article_types(self, article_types):
        # wrap types in ('TYPE')
        types_formatted = []
        for article_type in article_types:
            article_type = article_type.replace("'", "''")
            types_formatted.append(f"('{article_type}')")

        # build query
        query = f"""
            INSERT INTO ArticleType
                (Name)
            VALUES
                {','.join(types_formatted)};
        """

        # and run
        self.run_query(query)


    def get_author_id_lookup(self, authors):
        # wrap names in ('NAME')
        authors_formatted = []
        for author in authors:
            author = author.replace("'", "''")
            authors_formatted.append(f"('{author}')")

        # build query
        query = f"""
            SELECT
                Id, Name
            FROM
                Writer
            WHERE
                Name IN ({','.join(authors_formatted)})
        """

        # and run
        results = self.get_query(query)
        author_ids = {}
        for author in results:
            author_id = author[0]
            author_name = author[1]

            author_ids[author_name] = author_id
        
        return author_ids


    def get_url_id_lookup(self, urls):
        # wrap urls in ('URL')
        urls_formatted = []
        for url in urls:
            url = url.replace("'", "''")
            urls_formatted.append(f"('{url}')")

        # build query
        query = f"""
            SELECT
                Id, Url
            FROM
                ArticleUrl
            WHERE
                Url IN ({','.join(urls_formatted)})
        """

        # and run
        results = self.get_query(query)
        url_ids = {}
        for url in results:
            url_id = url[0]
            url_name = url[1]

            url_ids[url_name] = url_id
        
        return url_ids



    def insert_articles(self, articles):
        # wrap writer names in ('NAME')
        articles_formatted = []
        for article in articles:
            articles_formatted.append(f"('{article['title']}', '{article['subtitle']}', {article['url_id']}, {article['author_id']}, {article['publication_id']}, {article['date_published']}, {article['type_id']}, {article['is_archived']})")

        # build query
        query = f"""
            INSERT INTO Article
                (Title, Subtitle, UrlId, AuthorId, WebsiteId, DatePublished, ArticleTypeId, IsArchived)
            VALUES
                {','.join(articles_formatted)}
        """

        # and run
        self.run_query(query)



    def insert_tags(self, tags):
        # wrap writer names in ('NAME')
        tags_formatted = []
        for tag in tags:
            tag = tag.replace("'", "''")
            tags_formatted.append(f"('{tag}')")

        # build query
        query = f"""
            INSERT INTO Tag
                (Name)
            VALUES
                {','.join(tags_formatted)};
        """

        # and run
        self.run_query(query)


    def get_article_ids_lookup_from_urls(self, urls):
        # wrap urls in ('URL')
        urls_formatted = []
        for url in urls:
            url = url.replace("'", "''")
            urls_formatted.append(f"('{url}')")

        # build query
        query = f"""
            SELECT
                ArticleUrl.Url, Article.Id
            FROM
                ArticleUrl
            INNER JOIN
                Article
            ON
                ArticleUrl.Id = Article.UrlId
            WHERE
                Url IN ({','.join(urls_formatted)})
        """

        # and run
        results = self.get_query(query)
        article_ids = {}
        for url in results:
            url_string = url[0]
            article_id = url[1]

            article_ids[url_string] = article_id
        
        return article_ids


    def get_tag_ids_lookup(self):
        # build query
        query = f"""
            SELECT
                Id, Name
            FROM
                Tag
        """

        # and run
        results = {}
        for tag in self.get_query(query):
            tag_id = tag[0]
            tag_name = tag[1]

            results[tag_name] = tag_id

        return results


    def insert_article_tags(self, article_tags):
        article_tags_formatted = []
        for article_tag in article_tags:
            article_tags_formatted.append(f"({article_tag['article_id']}, {article_tag['tag_id']}, '{article_tag['hash_id']}')")

        # build query
        query = f"""
            INSERT INTO ArticleTag
                (ArticleId, TagId, HashId)
            VALUES
                {','.join(article_tags_formatted)}
        """

        # and run
        self.run_query(query)


    def insert_thumbnails(self, thumbnails):
        thumbnails_formatted = []
        for thumbnail in thumbnails:
            thumbnails_formatted.append(f"({thumbnail['article_id']}, '{thumbnail['filename']}')")

        # build query
        query = f"""
            INSERT INTO Thumbnail
                (ArticleId, Filename)
            VALUES
                {','.join(thumbnails_formatted)}
        """

        # and run
        self.run_query(query)


    def get_article_count_between_dates(self, start, end):
        # build query
        query = f"""
            SELECT
                Count(*) AS NumArticles, DatePublished
            FROM
                Article
            WHERE
                DatePublished >= {start} AND DatePublished <= {end}
            GROUP BY DatePublished
        """
        return self.get_query(query)