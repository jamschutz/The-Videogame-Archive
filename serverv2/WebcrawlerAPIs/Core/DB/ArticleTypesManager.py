import logging

from .DbManager import DbManager
from Entities.Article import Article


class ArticleTypesManager:

    def __init__(self):
        self.db = DbManager()


    # returns in the format [{'name': 'blog', 'id': news}]
    def get_article_types_and_create_if_not_exist(self, articles):
        types = [a.type for a in articles]
        return self.db.get_ids_and_create_if_not_exists('ArticleTypes', types)


    def insert(self, writers):
        self.db.insert_values('Writers', writers)

    def get_ids(self, writers):
        return self.db.get_ids('Writers', writers)








if __name__ == '__main__':
    manager = ArticleTypesManager()
    types = [
        Article(type="blog"),
        Article(type="review"),
        Article(type="review"),
        Article(type="TEST ARTICLE TYPE 1"),
        Article(type="TEST ARTICLE TYPE 2")
    ]

    print(manager.get_article_types_and_create_if_not_exist(types))