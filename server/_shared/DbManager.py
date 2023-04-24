import sqlite3
from datetime import datetime
from .._shared.Config import Config

class DbManager:
    def __init__(self):
        self.config = Config()


    # ============================================================ #
    # ========  Public Methods  ================================== #
    # ============================================================ #


    def get_articles_for_date(self, year, month=None, day=None, website_id=-1):
        # execute script, save, and close
        query = self.get_date_query(year, month, day, website_id)
        articles = self.get_query(query)

        articles_formatted = []
        for article in articles:
            # Article.Title, Article.DatePublished, Article.Url, Article.WebsiteId, Article.Subtitle, Writer.Name, Thumbnail.Filename
            articles_formatted.append({
                'title': article[0],
                'date': article[1],
                'url': article[2],
                'website': article[3],
                'subtitle': article[4],
                'author': article[5],
                'thumbnail': article[6]
            })

        return articles_formatted


    def get_urls_to_archive(self, limit, website_id, urls_to_ignore=[]):
        # build query
        query = f"""
            SELECT
                Title, Url, DatePublished, WebsiteId
            FROM
                Article
            WHERE
                IsArchived = 0 
        """
        if website_id > 0:
            query += f' AND WebsiteId = {website_id}'
        if len(urls_to_ignore) > 0:
            # make sure urls are wrapped in single quotes
            for i in range(len(urls_to_ignore)):
                if urls_to_ignore[i][0] != "'":
                    urls_to_ignore[i] = f"'{urls_to_ignore[i]}'"

            query += f' AND Url NOT IN ({",".join(urls_to_ignore)})'

        query += f"""
            LIMIT {limit}
        """
        articles = self.get_query(query)

        articles_formatted = []
        for article in articles:
            articles_formatted.append({
                'title': article[0],
                'url': article[1],
                'date': article[2],
                'website': article[3]
            })
        return articles_formatted


    def save_articles(self, articles):
        if len(articles) == 0: return
        query = f"""
            INSERT OR IGNORE INTO
                Article(Title, Url, WebsiteId, DatePublished, Type, IsArchived{', AuthorId' if 'author' in articles[0] else ''})
            VALUES
        """
        # for each article, add it's info to insert statement
        for article in articles:
            query += f"{self.get_sql_insert_command(article)},\n"

        # chop off trailing comma
        query = query[:-2]

        # and run
        self.run_query(query)

        # with articles created, add thumbnails and tags
        for article in articles:
            self.create_thumbnail(article)
            self.create_article_tags(article)


    def mark_articles_as_archived(self, articles):
        urls = []
        for article in articles:
            urls.append(f"'{article['url']}'")

        query = f"""
            UPDATE
                Article
            SET
                IsArchived = 1
            WHERE
                Url IN ({','.join(urls)})
        """
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


    def update_article(self, article):
        # get author id
        subtitle = article['subtitle'] if 'subtitle' in article else ''
        author_id = self.get_author_id(article['author']) if 'author' in article else None
        article_type = article['type'] if 'type' in article else None

        set_author_query = f",AuthorId = {author_id}" if author_id != None else ''
        set_type_query = f",Type = '{article_type}'" if article_type != None else ''

        # build query
        query = f"""
            UPDATE
                Article
            SET
                Subtitle = '{subtitle.replace("'", "''")}'
                {set_author_query}
                {set_type_query}
            WHERE
                Url = '{article['url']}'
        """
        self.run_query(query)


    def get_search_results(self, title_query, subtitle_query):
        # build query
        query = f"""
            SELECT
                Article.Title, Article.Subtitle, Article.Url, Article.DatePublished, Article.WebsiteId, Writer.Name AS Author, Thumbnail.Filename AS Thumbnail
            FROM
                Article
            INNER JOIN
                Writer
            ON
                Article.AuthorId = Writer.Id
            LEFT JOIN
                Thumbnail
            ON
                Article.Id = Thumbnail.ArticleId
            WHERE
                Article.Title LIKE '{title_query}' OR Article.Subtitle LIKE '{subtitle_query}'
            ORDER BY
                Article.DatePublished
        """
        results = []
        for article in self.get_query(query):
            # Article.Title, Article.Subtitle, Article.Url, Article.DatePublished, Article.WebsiteId, Writer.Name AS Author
            results.append({
                'title': article[0],
                'subtitle': article[1],
                'url': article[2],
                'date': article[3],
                'website_id': article[4],
                'author': article[5],
                'thumbnail': article[6]
            })
        return results


    # def get_articles_to_migrate(self, limit):
    #     # build query
    #     return ''


    
    def get_writers_to_migrate(self, skip, limit):
        # build query
        query = f"""
        SELECT
            Name
        FROM
            Writer
        LIMIT
            {skip}, {limit}
        """

        results = []
        for writer in self.get_query(query):
            results.append(writer[0]) # 0th index is the name

        return results


    
    def get_websites_to_migrate(self):
        # build query
        query = f"""
        SELECT
            Name, Founders, YearStarted, YearEnded, Url, Country, IsActive
        FROM
            Website
        """

        results = []
        for website in self.get_query(query):
            results.append({
                'name': website[0],
                'founders': website[1],
                'year_started': website[2],
                'year_ended': website[3],
                'url': website[4],
                'country': website[5],
                'is_active': website[6]
            }) 

        return results


    def get_article_urls_to_migrate(self, skip, limit):
        # build query
        query = f"""
        SELECT
            Url
        FROM
            Article
        LIMIT
            {skip}, {limit}
        """

        results = []
        for url in self.get_query(query):
            results.append(url[0]) # 0th index is the url string

        return results


    def get_article_types_to_migrate(self):
        # build query
        query = f"""
        SELECT DISTINCT
            Type
        FROM
            Article
        """

        results = []
        for article_type in self.get_query(query):
            type_name = article_type[0] if article_type[0] != 'None' else 'null'
            results.append(type_name)

        return results


    def get_articles_to_migrate(self, limit):
        # build query
        query = f"""
        SELECT
            Article.Title, Article.Subtitle, Article.Url, Writer.Name, Website.Name, Article.DatePublished, Article.Type, Article.IsArchived
        FROM
            Article
        INNER JOIN
            Website
        ON
            Website.Id = Article.WebsiteId
        LEFT JOIN
            Writer
        ON
            Writer.Id = Article.AuthorId
        WHERE
            Article.IsMigrated = 0
        LIMIT
            {limit}
        """

        results = []
        for article in self.get_query(query):
            results.append({
                'title': article[0],
                'subtitle': article[1],
                'url': article[2],
                'author': article[3],
                'website': article[4],
                'date_published': article[5],
                'type': article[6],
                'is_archived': article[7]
            }) 

        return results



    def mark_articles_as_migrated(self, urls):
        # wrap urls in ('URL')
        urls_formatted = []
        for url in urls:
            url = url.replace("'", "''")
            urls_formatted.append(f"'{url}'")

        # build query
        query = f"""
            UPDATE
                Article
            SET
                IsMigrated = 1
            WHERE
                Url IN ({','.join(urls_formatted)})
        """
        self.run_query(query)


    
    def get_tags_to_migrate(self):
        # build query
        query = f"""
        SELECT
            Name
        FROM
            Tag
        """

        results = []
        for tag in self.get_query(query):
            results.append(tag[0]) # 0th index is the name

        return results


    def get_article_tags_to_migrate(self, skip, limit):
        # build query
        query = f"""
            SELECT
                Article.Url, Tag.Name
            FROM
                ArticleTag
            INNER JOIN
                Article
            ON
                ArticleTag.ArticleId = Article.Id
            LEFT JOIN
                Tag
            ON
                ArticleTag.TagId = Tag.Id
            LIMIT 
                {skip}, {limit}
        """

        results = []
        for article_tag in self.get_query(query):
            results.append({
                'article_url': article_tag[0],
                'tag': article_tag[1]
            })
        return results


    def get_thumbnails_to_migrate(self, skip, limit):
        # build query
        query = f"""
        SELECT
            Thumbnail.Id, Thumbnail.Filename, Article.Url
        FROM
            Thumbnail
        INNER JOIN
            Article
        ON
            Thumbnail.ArticleId = Article.Id
        LIMIT
            {skip}, {limit}
        """

        results = []
        for article in self.get_query(query):
            results.append({
                'sqlite_id': article[0],
                'filename': article[1],
                'url': article[2]
            }) 

        return results



    def mark_thumbnails_as_migrated(self, thumbnails):
        # wrap urls in ('URL')
        ids_formatted = []
        for thumbnail in thumbnails:
            ids_formatted.append(f"{thumbnail['sqlite_id']}")

        # build query
        query = f"""
            UPDATE
                Thumbnail
            SET
                IsMigrated = 1
            WHERE
                Id IN ({','.join(ids_formatted)})
        """
        self.run_query(query)



    # ============================================================ #
    # ========  Main Methods  ==================================== #
    # ============================================================ #

    def run_query(self, query):
        # connect to db, and save
        db = sqlite3.connect(self.config.DATABASE_FILE)
        cursor = db.cursor()

        # execute script, save, and close
        cursor.execute(query)
        db.commit()
        db.close()


    def get_query(self, query):
        # connect to db, and fetch
        db = sqlite3.connect(self.config.DATABASE_FILE)
        cursor = db.cursor()
        result = cursor.execute(query)
        result = result.fetchall()
        db.close()

        return result


    # ============================================================ #
    # ========  GET Methods   ==================================== #
    # ============================================================ #

    def get_author_id(self, author):
        query = f"""
            SELECT
                Id, Name
            FROM
                Writer
            WHERE
                Name = '{author}'
        """
        authors = self.get_query(query)

        # if no authors, make a new entry
        if len(authors) == 0:
            print(f'no author named {author} found. making a new entry...')
            self.create_author(author)
            return self.get_author_id(author)
        # if *multiple* authors with that name, we have a problem...
        elif len(authors) > 1:
            raise Exception(f'ERROR!!!!! Multiple authors with the name {author} were found')
            return None

        # parse author id and return
        author_id = authors[0][0]
        return author_id


    def get_article_id(self, article):
        website_id = self.config.website_id_lookup[article['website']]
        # build query
        query = f"""
            SELECT
                Id
            FROM
                Article
            WHERE
                WebsiteId = {website_id} AND Url = '{article['url']}'
        """
        results = self.get_query(query)
        return results[0][0]


    def get_tag_id(self, tag):
        # build query
        query = f"""
            SELECT
                Id
            FROM
                Tag
            WHERE
                Name = '{tag}'
        """
        results = self.get_query(query)
        if len(results) == 0:
            return None

        return results[0][0]


    # ============================================================ #
    # ========  CREATE Methods   ================================= #
    # ============================================================ #


    def create_thumbnail(self, article):
        # if no thumbnail, just return
        if 'thumbnail_filename' not in article:
            return

        # get article id
        article_id = self.get_article_id(article)
        thumbnail_filename = article['thumbnail_filename']

        # build query
        query = f"""
            INSERT OR IGNORE INTO
                Thumbnail(ArticleId, Filename)
            VALUES
                ({article_id}, '{thumbnail_filename}')
        """
        self.run_query(query)


    def create_tag(self, tag):
        # build query
        query = f"""
            INSERT INTO
                Tag(Name)
            VALUES
                ('{tag}')
        """
        self.run_query(query)


    def create_author(self, author):
        query = f"""
            INSERT INTO
                Writer(Name)
            VALUES
                ('{author}')
        """
        self.run_query(query)


    def create_article_tags(self, article):
        # if no tags, just bail
        if 'tags' not in article or len(article['tags']) == 0:
            return

        # get article id
        article_id = self.get_article_id(article)

        for tag in article['tags']:
            tag = tag.replace("'", "''")
            tag_id = self.get_tag_id(tag)

            # if no tag exists yet, create one
            if tag_id == None:
                self.create_tag(tag)
                tag_id = self.get_tag_id(tag)

            # build unique name to avoid duplicate entries
            hash_id = f'{str(article_id)}_{str(tag_id)}'

            # build query
            query = f"""
                INSERT OR IGNORE INTO
                    ArticleTag(ArticleId, TagId, HashId)
                VALUES
                    ({article_id}, {tag_id}, '{hash_id}')
            """
            self.run_query(query)
        


    # ============================================================ #
    # ========  Helper Methods   ================================= #
    # ============================================================ #


    def get_date_query(self, year, month, day, website_id):
        date_published = int(year) * 10000 + int(month) * 100 + int(day)
        query = f"""
            SELECT 
                Article.Title, Article.DatePublished, Article.Url, Article.WebsiteId, Article.Subtitle, Writer.Name, Thumbnail.Filename
            FROM 
                Article
            INNER JOIN
                Writer ON Article.AuthorId = Writer.Id
            LEFT JOIN
                Thumbnail ON Article.Id = Thumbnail.ArticleId
            WHERE
                DatePublished = {date_published}
        """
        if website_id >= 0:
            query += f" AND WebsiteId = {website_id}"

        return query



    def get_sql_insert_command(self, article):
        # parse the bits we need (for folder / filename)
        url = article['url']
        title = article['title'].replace("'", "''") # escape single quotes (' --> '')
        website = article['website']
        article_type = article['type'] if 'type' in article else None
        author = None if 'author' not in article else article['author']
        author_id = None if author == None else self.get_author_id(author)

        month = article['date'].split('/')[0]
        day   = article['date'].split('/')[1]
        year  = article['date'].split('/')[2]

        date_published = int(year) * 10000 + int(month) * 100 + int(day)

        # Title, Url, WebsiteId, DatePublished, Type, IsArchived, AuthorId?
        optional_author_id = f', {author_id}' if author_id != None else ''
        return f"('{title}', '{url}', {self.config.website_id_lookup[website]}, {date_published}, '{article_type}', 0{optional_author_id})"



#---------------------------------------- #
# ----- testing ------------------------- #
if __name__ == '__main__':
    db_manager = DbManager()
    test = {
        'url': 'https://www.gamespot.com/articles/ace-combat-4-preview/1100-2681406/',
        'subtitle': "Ace Combat 4 gives you a chance to step into the cockpits of the world's most technologically advanced fighters. While its photo-realistic graphics clearly separate it from its PlayStation roots, you can expect the series' arcadelike gameplay to remain intact.",
        'author': 'Chris Kirchgasler'
    }
    writers = db_manager.get_writers_to_migrate(skip=0, limit=1000)
    print(writers)