import psycopg2

from Core.Secrets import Secrets


class DbManager:

    def __init__(self):
        self.secrets = Secrets()

    def run_query(self, query):
        connection = psycopg2.connect(
            database = self.secrets.POSTGRESQL_DB_NAME,
            user = self.secrets.POSTGRESQL_DB_USER,
            password = self.secrets.POSTGRESQL_DB_PASSWORD,
            host = self.secrets.POSTGRESQL_DB_HOST,
            port = self.secrets.POSTGRESQL_DB_PORT
        )

        cursor = connection.cursor()
        cursor.execute(query)
        connection.commit()
        connection.close()


    def get_query(self, query):
        connection = psycopg2.connect(
            database = self.secrets.POSTGRESQL_DB_NAME,
            user = self.secrets.POSTGRESQL_DB_USER,
            password = self.secrets.POSTGRESQL_DB_PASSWORD,
            host = self.secrets.POSTGRESQL_DB_HOST,
            port = self.secrets.POSTGRESQL_DB_PORT
        )

        cursor = connection.cursor()
        cursor.execute(query)
        results = cursor.fetchall()
        connection.close()

        return results