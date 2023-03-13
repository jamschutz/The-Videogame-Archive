import sqlite3
from datetime import datetime
from .._shared.Config import Config

class DbManager:
    def __init__(self):
        self.config = Config()


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
        # connect to db, and save
        db = sqlite3.connect(self.config.DATABASE_FILE)
        cursor = db.cursor()

        # execute script, save, and close
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

        result = cursor.execute(query)
        articles = result.fetchall()
        db.close()

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



    def get_sql_insert_command(self, article):
        # parse the bits we need (for folder / filename)
        url = article['url']
        title = article['title'].replace("'", "''") # escape single quotes (' --> '')
        website = article['website']
        article_type = article['type'] if 'type' in article else None

        month = article['date'].split('/')[0]
        day   = article['date'].split('/')[1]
        year  = article['date'].split('/')[2]

        date_published_epoch = (datetime(int(year), int(month), int(day)) - datetime(1970, 1, 1)).total_seconds()

        # Title, Url, WebsiteId, DatePublished, Type, YearPublished, MonthPublished, DayPublished
        return f"('{title}', '{url}', {self.config.website_id_lookup[website]}, {date_published_epoch}, '{article_type}', {year}, {month}, {day})"


    def save_articles(self, articles):
        sql_script = f"""
            INSERT OR IGNORE INTO
                Article(Title, Url, WebsiteId, DatePublished, Type, YearPublished, MonthPublished, DayPublished)
            VALUES
        """

        # for each article, add it's info to insert statement
        for article in articles:
            sql_script += f"{self.get_sql_insert_command(article)},\n"

        # chop off trailing comma
        sql_script = sql_script[:-2]

        # connect to db, and save
        db = sqlite3.connect(self.config.DATABASE_FILE)
        cursor = db.cursor()

        # execute script, save, and close
        result = cursor.execute(sql_script)
        db.commit()
        db.close()


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


    def save_new_author(self, author):
        query = f"""
            INSERT INTO
                Writer(Name)
            VALUES
                ('{author}')
        """

        # connect to db, and save
        db = sqlite3.connect(self.config.DATABASE_FILE)
        cursor = db.cursor()

        # execute script, save, and close
        result = cursor.execute(query)
        db.commit()
        db.close()


    def get_author_id(self, author):
        query = f"""
            SELECT
                Id, Name
            FROM
                Writer
            WHERE
                Name = '{author}'
        """
        # connect to db, and fetch
        db = sqlite3.connect(self.config.DATABASE_FILE)
        cursor = db.cursor()
        result = cursor.execute(query)
        authors = result.fetchall()
        db.close()

        # if no authors, make a new entry
        if len(authors) == 0:
            print(f'no author named {author} found. making a new entry...')
            self.save_new_author(author)
            return self.get_author_id(author)
        # if *multiple* authors with that name, we have a problem...
        elif len(authors) > 1:
            raise Exception(f'ERROR!!!!! Multiple authors with the name {author} were found')
            return None

        # parse author id and return
        author_id = authors[0][0]
        return author_id


    def update_article(self, article):
        # get author id
        author_id = self.get_author_id(article['author'])
        subtitle = article['subtitle'] if 'subtitle' in article else ''
        article_type = article['type'] if 'type' in article else None
        set_type_query = f",Type = '{article_type}'" if article_type != None else ''

        # build query
        query = f"""
            UPDATE
                Article
            SET
                AuthorId = {author_id},
                Subtitle = '{subtitle.replace("'", "''")}'
                {set_type_query}
            WHERE
                Url = '{article['url']}'
        """
        self.run_query(query)


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



if __name__ == '__main__':
    db_manager = DbManager()
    test = {
        'url': 'https://www.gamespot.com/articles/ace-combat-4-preview/1100-2681406/',
        'subtitle': "Ace Combat 4 gives you a chance to step into the cockpits of the world's most technologically advanced fighters. While its photo-realistic graphics clearly separate it from its PlayStation roots, you can expect the series' arcadelike gameplay to remain intact.",
        'author': 'Chris Kirchgasler'
    }
    db_manager.update_article(test)