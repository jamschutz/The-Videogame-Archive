import sqlite3, pyodbc
from datetime import datetime
from .._shared.Config import Config
from .._shared.Secrets import Secrets

class WaybackDbManager:
    def __init__(self):
        self.config = Config()
        self.secrets = Secrets()

        self.connection_string = 'DRIVER='+self.secrets.SQL_DRIVER+';SERVER=tcp:'+self.secrets.SQL_SERVER_NAME+';PORT=1433;DATABASE='+self.secrets.SQL_DB_NAME+';UID='+self.secrets.SQL_SERVER_ADMIN_USER+';PWD='+ self.secrets.SQL_SERVER_ADMIN_PASSWORD


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

    def save_new_wayback_url(self, url, website_id):
        # query = f"""
        #     INSERT 
        #         Url (Url, WebsiteId)
        #     SELECT 
        #         Url, WebsiteId
        #     FROM 
        #         (VALUES('{url}', {website_id})) 
        #         U(Url, WebsiteId)
        #     WHERE NOT EXISTS 
        #         (SELECT 1
        #         FROM 
        #             Url other
        #         WHERE 
        #             other.Url = u.Url
        #         );
        # """
        query = f"""
            INSERT INTO
                Url(Url, WebsiteId)
            VALUES
                ('{url}', {website_id})
        """
        self.run_query(query)


    def get_wayback_url_id(self, url, website_id):
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
            print(f'no wayback url named {url} found. making a new entry...')
            self.save_new_wayback_url(url, website_id)
            return self.get_wayback_url_id(url, website_id)
        # if *multiple* authors with that name, we have a problem...
        elif len(results) > 1:
            raise Exception(f'ERROR!!!!! Multiple wayback url entries with the url {url} were found')
            return None

        # parse author id and return
        url_id = results[0][0]
        return url_id


    def get_valid_snapshots(self, snapshots):
        valid_snapshots = []
        for snapshot in snapshots:
            if snapshot['statuscode'] != '301' and snapshot['statuscode'] != '200':
                continue

            if '/a/uploads/' in snapshot['url_data'] and 'gamespot.com' in snapshot['url']:
                continue

            valid_snapshots.append(snapshot)

        return valid_snapshots


    def create_urls_that_dont_exist(self, snapshots, url_ids, website_id):
        urls_to_create = []
        urls_added = set()
        for snapshot in snapshots:
            if snapshot['url'] not in url_ids and snapshot['url'] not in urls_added:
                urls_to_create.append(f"('{snapshot['url']}', {website_id})")
                urls_added.add(snapshot['url'])

        offset = 0
        while offset < len(urls_to_create):
            query = f"""
                INSERT INTO
                    Url(Url, WebsiteId)
                VALUES
                    {','.join(urls_to_create[offset:offset + 1000])}
            """
            print(query)
            self.run_query(query)
            offset += 1000


    def get_url_ids(self, snapshots, website_id):
        urls = []
        # wrap urls in ''
        for snapshot in snapshots:
            urls.append(f"'{snapshot['url']}'")

        query = f"""
            SELECT
                Id, Url
            FROM
                Url
            WHERE
                WebsiteId = {website_id} AND Url IN ({','.join(urls)})
        """
        db_result = self.get_query(query)

        url_lookup = {}
        for url in db_result:
            url_id = url[0]
            url_data = url[1]

            url_lookup[url_data] = url_id

        return url_lookup



    def get_snapshot_values(self, snapshots, url_ids, website_id):
        snapshot_values = []
        for snapshot in snapshots:
            urlkey = snapshot['url_data']
            timestamp = snapshot['timestamp']
            statuscode = 'NULL' if snapshot['statuscode'] == None else snapshot['statuscode']
            raw_url = snapshot['raw_url']
            wayback_url_id = url_ids[snapshot['url']]

            # UrlKey, Timestamp, UrlId, StatusCode, WebsiteId, RawUrl
            snapshot_values.append(f"('{urlkey}', '{timestamp}', {wayback_url_id}, {statuscode}, {website_id}, '{raw_url}')")

        return snapshot_values


    def add_wayback_snapshots(self, snapshots, website, current_file):
        website_id = self.config.website_id_lookup[website]

        print(f'building query...({current_file})')
        query = f"""
            INSERT INTO
                Snapshot(UrlKey, Timestamp, UrlId, StatusCode, WebsiteId, RawUrl)
            VALUES
        """

        print('getting valid snapshots...')
        snapshots = self.get_valid_snapshots(snapshots)
        print('getting url ids...')
        url_ids = self.get_url_ids(snapshots, website_id)
        print('creating new url entries that dont exist yet...')
        self.create_urls_that_dont_exist(snapshots, url_ids, website_id)
        print('getting full url id list...')
        url_ids = self.get_url_ids(snapshots, website_id)

        snapshot_values = self.get_snapshot_values(snapshots, url_ids, website_id)

        offset = 0
        while offset < len(snapshot_values):
            query = f"""
                INSERT INTO
                    Snapshot(UrlKey, Timestamp, UrlId, StatusCode, WebsiteId, RawUrl)
                VALUES
                    {','.join(snapshot_values[offset:offset + 1000])}
            """
            query_number = int(offset / 1000)
            total_queries = int(len(snapshot_values) / 1000)
            print(f'running query {query_number} of {total_queries}...')
            self.run_query(query)
            offset += 1000

        print(f'running query...({current_file})')
        self.run_query(query)


    def get_urls_for_website(self, website, offset, batch_size):
        website_id = self.config.website_id_lookup[website]

        query = f"""
            SELECT
                Id, Url
            FROM
                Url
            WHERE
                WebsiteId = {website_id}
            LIMIT {batch_size} OFFSET {offset}
        """
        return self.get_query(query)