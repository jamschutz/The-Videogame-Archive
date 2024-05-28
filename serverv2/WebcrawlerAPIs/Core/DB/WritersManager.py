import logging

from .DbManager import DbManager
from Entities.Article import Article


class WritersManager:

    def __init__(self):
        self.db = DbManager()




    # ==================================================================== #
    # ============    GET METHODS    ===================================== #
    # ==================================================================== #


    # returns in the format [{'name': 'Joey Schutz', 'authorid': 1234}]
    def get_writers_and_create_if_not_exist(self, articles):
        writers = [a.author for a in articles]
        return self.db.get_ids_and_create_if_not_exists('Writers', writers)




    # ==================================================================== #
    # ============    INSERT METHODS    ================================== #
    # ==================================================================== #


    def insert_writers(self, writers):
        self.db.insert_values('Writers', writers)



    # ==================================================================== #
    # ============    HELPER METHODS    ================================== #
    # ==================================================================== #

    def get_writer_ids(self, writers):
        return self.db.get_ids('Writers', writers)


if __name__ == '__main__':
    writers = WritersManager()
    articles = [
        Article(author="Chris Kirchgasler"),
        Article(author="Trey Walker"),
        Article(author="Hugo Foster"),
        Article(author="dummy test1"),
        Article(author="dummy test2")
    ]

    print(writers.get_writers_and_create_if_not_exist(articles))

    print(writers.get_writer_ids(['Chris Kirchgasler', 'Trey Walker']))