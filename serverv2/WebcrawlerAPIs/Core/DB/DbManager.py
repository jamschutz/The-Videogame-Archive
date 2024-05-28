import psycopg2

from Core.Secrets import Secrets


class DbManager:

    def __init__(self):
        self.secrets = Secrets()


    # ==================================================================== #
    # ============    MAIN METHODS    ==================================== #
    # ==================================================================== #

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
    



    # ==================================================================== #
    # ============    GENERIC DATA METHODS    ============================ #
    # ==================================================================== #

    def get_ids(self, column, values):
        # wrap values in single quotes
        values = [f"'{v}'" for v in values]
        query = f"""
            SELECT
                "Id", "Name"
            FROM
                "{column}"
            WHERE
                "Name" IN ({','.join(values)})
        """
        results = self.get_query(query)
        return [{'id': a[0], 'name': a[1]} for a in results]
    


    def insert_values(self, column, values):
        if len(values) == 0:
            return
        
        values = [v.replace("'", "''") for v in values]
        values = [f"('{v}')" for v in values]
        query = f"""
            INSERT INTO
                "{column}"("Name")
            VALUES
                {','.join(values)}
        """

        self.run_query(query)
    
    

    def get_ids_and_create_if_not_exists(self, column, values):
        # ensure values are unique
        values = list(set(values))

        # get authors that currently exist in db
        existing_data = self.get_ids(column, values)

        # get values that don't yet exist...
        values_in_db = [d['name'] for d in existing_data]
        values_to_insert = list(set(values).difference(values_in_db))

        # insert those values, and get their ids
        new_value_ids = []
        if len(values_to_insert) > 0:
            self.insert_values(column, values_to_insert)
            new_value_ids = self.get_ids(column, values_to_insert)

        # combine existing and new and return
        results = {}
        for data in existing_data:
            results[data['name']] = data['id']
        for data in new_value_ids:
            results[data['name']] = data['id']
        return results