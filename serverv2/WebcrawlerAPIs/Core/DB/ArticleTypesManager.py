import logging

from .DbManager import DbManager
from Entities.Article import Article


class ArticleTypesManager:

    def __init__(self):
        self.db = DbManager()




    # ==================================================================== #
    # ============    GET METHODS    ===================================== #
    # ==================================================================== #


    # returns in the format [{'name': 'news', 'id': 1234}]
    def get_article_types_and_create_if_not_exist(self, articles):
        # get types that currently exist in db
        types = [f"'{a.author}'" for a in articles]
        existing_types = self.__get_article_type_ids(authors)

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

    def __get_article_type_ids(self, types):
        # wrap types in single quotes
        types = [f"'{t}'" for t in types]
        query = f"""
            SELECT
                "Id", "Name"
            FROM
                "ArticleTypes"
            WHERE
                "Name" IN ({','.join(types)})
        """
        results = self.db.get_query(query)
        return [{'id': t[0], 'name': t[1]} for t in results]
    

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