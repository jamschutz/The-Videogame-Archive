import sqlite3
from datetime import datetime
from .._shared.Config import Config

class WaybackDbManager:
    def __init__(self):
        self.config = Config()


    def run_query(self, query):
        # connect to db, and save
        db = sqlite3.connect(self.config.WAYBACK_DATABASE_FILE)
        cursor = db.cursor()

        # execute script, save, and close
        cursor.execute(query)
        db.commit()
        db.close()


    def get_query(self, query):
        # connect to db, and fetch
        db = sqlite3.connect(self.config.WAYBACK_DATABASE_FILE)
        cursor = db.cursor()
        result = cursor.execute(query)
        result = result.fetchall()
        db.close()

        return result

    def save_new_wayback_url(self, url, website_id):
        query = f"""
            INSERT INTO
                Url(Url, WebsiteId)
            VALUES
                ('{url}', {website_id})
        """
        self.run_query(query)


    def get_wayback_url_id(self, url, website_id, current_file):
        query = f"""
            SELECT
                Id, Url
            FROM
                Url
            WHERE
                Url = '{url}'
        """
        # connect to db, and fetch
        results = self.get_query(query)

        # if no authors, make a new entry
        if len(results) == 0:
            print(f'no wayback url named {url} found. making a new entry... ({current_file})')
            self.save_new_wayback_url(url, website_id)
            return self.get_wayback_url_id(url, website_id, current_file)
        # if *multiple* authors with that name, we have a problem...
        elif len(results) > 1:
            raise Exception(f'ERROR!!!!! Multiple wayback url entries with the url {url} were found')
            return None

        # parse author id and return
        url_id = results[0][0]
        return url_id


    def get_snapshot_insert(self, snapshot, website_id, current_file):
        # ignore all status codes other than 301 or 200
        if(snapshot['statuscode'] != '301' and snapshot['statuscode'] != '200'):
            return ''

        # ignore all urls under /a/uploads/
        if('/a/uploads/' in snapshot['url_data']):
            return ''


        urlkey = snapshot['url_data']
        timestamp = snapshot['timestamp']
        mimetype = snapshot['mimetype']
        statuscode = 'NULL' if snapshot['statuscode'] == None else snapshot['statuscode']
        digest = snapshot['digest']
        length = snapshot['length']
        raw_url = snapshot['raw_url']
        wayback_url_id = self.get_wayback_url_id(snapshot['url'], website_id, current_file)

        return f"\t\t\t\t('{urlkey}', '{timestamp}', {wayback_url_id}, '{mimetype}', {statuscode}, '{digest}', {length}, {website_id}, '{raw_url}'),\n"


    def add_wayback_snapshots(self, snapshots, website, current_file):
        website_id = self.config.website_id_lookup[website]

        print(f'building query...({current_file})')
        query = f"""
            INSERT OR IGNORE INTO
                Snapshot(UrlKey, Timestamp, UrlId, MimeType, StatusCode, Digest, ResponseLength, WebsiteId, RawUrl)
            VALUES
        """
        for snapshot in snapshots:
            query += self.get_snapshot_insert(snapshot, website_id, current_file) + ' '

        # remove trailing space and comma from last value
        query = query[:query.rfind(',')]

        with open(f'query.txt', "w", encoding="utf-8") as f:
            f.write(query)

        # if no tabs, means we didn't insert any snapshots...skip!
        if '\t' not in query:
            print(f'no urls to add in file {current_file}')
            return

        print(f'running query...({current_file})')
        self.run_query(query)