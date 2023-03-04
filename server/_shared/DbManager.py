import sqlite3
from datetime import datetime
from .._shared.Config import Config

class DbManager:
    def __init__(self):
        self.config = Config()


    def get_date_query(self, year, month, day, website_id):
        query = f"SELECT Title, MonthPublished, DayPublished, Url, WebsiteId FROM Article WHERE YearPublished = {year}"
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
                'website': article[4]
            })

        return articles_formatted


    def get_urls_to_archive(self, limit, website_id):
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