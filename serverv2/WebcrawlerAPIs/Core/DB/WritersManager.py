import logging

from .DbManager import DbManager
from Entities.Article import Article


class WritersManager:

    def __init__(self):
        self.db = DbManager()


    # returns in the format [{'name': 'Joey Schutz', 'authorid': 1234}]
    def get_writers_and_create_if_not_exist(self, articles):
        writers = [a.author for a in articles]
        return self.db.get_ids_and_create_if_not_exists('Writers', writers)

    def get_writer_and_create_if_not_exists(self, writer):
        return self.db.get_ids_and_create_if_not_exists('Writers', [writer])[writer]

    def insert(self, writers):
        self.db.insert_values('Writers', writers)

    def get_ids(self, writers):
        return self.db.get_ids('Writers', writers)

    def get_id(self, writer):
        return self.db.get_ids('Writers', [writer])[writer]








if __name__ == '__main__':
    writers = WritersManager()
    articles = [
        Article(author="Chris Kirchgasler"),
        Article(author="Trey Walker"),
        Article(author="Hugo Foster"),
        Article(author="dummy test1"),
        Article(author="dummy test3"),
        Article(author="dummy test3")
    ]

    print(writers.get_writers_and_create_if_not_exist(articles))

    print(writers.get_ids(['Chris Kirchgasler', 'Trey Walker']))