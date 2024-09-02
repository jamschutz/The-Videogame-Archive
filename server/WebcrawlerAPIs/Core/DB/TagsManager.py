import logging

from .DbManager import DbManager
from Entities.Article import Article


class TagsManager:

    def __init__(self):
        self.db = DbManager()


    # returns in the format [{'name': 'blog', 'id': 1234}]
    def get_tags_and_create_if_not_exist(self, articles):
        tags = []
        for a in articles:
            tags.extend(a.tags)

        return self.db.get_ids_and_create_if_not_exists('Tags', tags)


    def insert(self, tags):
        self.db.insert_values('Tags', tags)

    def get_ids(self, tags):
        return self.db.get_ids('Tags', tags)








if __name__ == '__main__':
    manager = TagsManager()
    articles = [
        Article(tags=["wholesome","co-op"]),
        Article(tags=["xbox one",'wii-u']),
        Article(tags=[]),
        Article(),
        Article(tags=['TEST DUMMY TAG 1', 'TEST DUMMY TAG 2', 'wholesome'])
    ]

    print(manager.get_tags_and_create_if_not_exist(articles))