import sqlite3
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


    def get_archived_websites(self):
        limit = request.args.get('limit') if request.args.get('websiteId') != None else 50
        website_id = int(request.args.get('websiteId')) if request.args.get('websiteId') != None else -1

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