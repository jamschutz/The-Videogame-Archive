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
        # connect to db, and save
        db = sqlite3.connect(self.config.DATABASE_FILE)
        cursor = db.cursor()

        # execute script, save, and close
        query = self.get_date_query(year, month, day, website_id)    
        result = cursor.execute(query)
        articles = result.fetchall()
        db.close()

        articles_formatted = []
        for article in articles:
            articles_formatted.append({
                'title': article[0],
                'month': article[1],
                'day': article[2],
                'url': article[3],
                'website': article[4],
                'subtitle': article[5],
                'author': article[6]
            })

        return articles_formatted


    def get_urls_to_archive(self, limit, website_id, urls_to_ignore=[]):
        # build query
        query = f"""
            SELECT
                Title, Url, YearPublished, MonthPublished, DayPublished, WebsiteId
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
                'year': article[2],
                'month': article[3],
                'day': article[4],
                'website': article[5]
            })
        return articles_formatted


    def save_articles(self, articles):
        if len(articles) == 0: return
        query = f"""
            INSERT OR IGNORE INTO
                Article(Title, Url, WebsiteId, DatePublished, Type, YearPublished, MonthPublished, DayPublished, IsArchived{', AuthorId' if 'author' in articles[0] else ''})
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

        sql_script = f"""
            UPDATE
                Article
            SET
                IsArchived = 1
            WHERE
                Url IN ({','.join(urls)})
        """

        # connect to db, and save
        db = sqlite3.connect(self.config.DATABASE_FILE)
        cursor = db.cursor()

        # execute script, save, and close
        result = cursor.execute(sql_script)
        db.commit()
        db.close()


    def get_article_count_between_dates(self, start, end):
        # build query
        query = f"""
            SELECT
                Count(*) AS NumArticles, YearPublished, MonthPublished, DayPublished
            FROM
                Article
            WHERE
                DatePublished >= {start} AND DatePublished <= {end}
            GROUP BY DatePublished
        """
        results = self.get_query(query)
        return results


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


    def get_search_results(self, title_query, subtitle_query):
        # build query
        query = f"""
            SELECT
                Article.Title, Article.Subtitle, Article.Url, Article.YearPublished, Article.MonthPublished, Article.DayPublished, Article.WebsiteId, Writer.Name AS Author
            FROM
                Article
            INNER JOIN
                Writer
            ON
                Article.AuthorId = Writer.Id
            WHERE
                Article.Title LIKE '{title_query}' OR Article.Subtitle LIKE '{subtitle_query}'
            ORDER BY
                Article.DatePublished
        """
        return self.get_query(query)


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
        # query = f"SELECT Title, MonthPublished, DayPublished, Url, WebsiteId FROM Article WHERE YearPublished = {year}"
        query = f"""
            SELECT 
                Article.Title, Article.MonthPublished, Article.DayPublished, Article.Url, Article.WebsiteId, Article.Subtitle, Writer.Name
            FROM 
                Article
            INNER JOIN
                Writer ON Article.AuthorId = Writer.Id
            WHERE
                YearPublished = {year}
        """
        if month != None:
            query += f' AND MonthPublished = {month}'
        if day != None:
            query += f' AND DayPublished = {day}'
        if website_id >= 0:
            query += f"AND WebsiteId = {website_id}"

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

        date_published_epoch = (datetime(int(year), int(month), int(day)) - datetime(1970, 1, 1)).total_seconds()

        # Title, Url, WebsiteId, DatePublished, Type, YearPublished, MonthPublished, DayPublished, IsArchived, AuthorId?
        optional_author_id = f', {author_id}' if author_id != None else ''
        return f"('{title}', '{url}', {self.config.website_id_lookup[website]}, {date_published_epoch}, '{article_type}', {year}, {month}, {day}, 0{optional_author_id})"



#---------------------------------------- #
# ----- testing ------------------------- #
if __name__ == '__main__':
    db_manager = DbManager()
    test = {
        'url': 'https://www.gamespot.com/articles/ace-combat-4-preview/1100-2681406/',
        'subtitle': "Ace Combat 4 gives you a chance to step into the cockpits of the world's most technologically advanced fighters. While its photo-realistic graphics clearly separate it from its PlayStation roots, you can expect the series' arcadelike gameplay to remain intact.",
        'author': 'Chris Kirchgasler'
    }
    db_manager.update_article(test)