import logging

from .DbManager import DbManager
from Entities.Article import Article


class WritersManager:

    def __init__(self):
        self.db = DbManager()




    # ==================================================================== #
    # ============    GET METHODS    ===================================== #
    # ==================================================================== #


    # returns in the format [{'url': 'www.test.com', 'authorid': 1234}]
    def get_authors_and_create_if_not_exist(self, articles):
        # get authors that currently exist in db
        authors = [f"'{a.author}'" for a in articles]
        existing_authors = self.__get_author_ids(authors)

        # get authors that don't yet exist...
        all_authors = [a.author for a in articles]
        authors_in_db = [a['name'] for a in existing_authors]
        authors_to_insert = self.__get_authors_not_in_db(all_authors, authors_in_db)

        # insert those writers, and get their ids
        new_author_ids = []
        if len(authors_to_insert) > 0:
            self.insert_writers(authors_to_insert)
            new_author_ids = self.__get_author_ids([f"'{a}'" for a in authors_to_insert])

        # combine existing and new and return
        all_authors = existing_authors
        all_authors.extend(new_author_ids)
        return all_authors




    # ==================================================================== #
    # ============    INSERT METHODS    ================================== #
    # ==================================================================== #


    def insert_writers(self, writers):
        if len(writers) == 0:
            return
        
        writers = [w.replace("'", "''") for w in writers]
        writers_formatted = [f"('{w}')" for w in writers]
        query = f"""
            INSERT INTO
                "Writers"("Name")
            VALUES
                {','.join(writers_formatted)}
        """

        self.db.run_query(query)





    # ==================================================================== #
    # ============    HELPER METHODS    ================================== #
    # ==================================================================== #

    def __get_author_ids(self, authors):
        query = f"""
            SELECT
                "Id", "Name"
            FROM
                "Writers"
            WHERE
                "Name" IN ({','.join(authors)})
        """
        results = self.db.get_query(query)
        return [{'id': a[0], 'name': a[1]} for a in results]
    

    def __get_authors_not_in_db(self, all_authors, in_db):
        return list(set(all_authors).difference(in_db))


if __name__ == '__main__':
    writers = WritersManager()
    articles = [
        Article(author="Chris Kirchgasler"),
        Article(author="Trey Walker"),
        Article(author="Hugo Foster"),
        Article(author="dummy test1"),
        Article(author="dummy test2")
    ]

    print(writers.get_authors_and_create_if_not_exist(articles))