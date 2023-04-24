from server._shared.Config import Config
from server._shared.Utils import Utils
from server._shared.DbManager import DbManager
from server._shared.AzureDbManager import AzureDbManager


sqlite_db = DbManager()
azure_db = AzureDbManager()
config = Config()
utils = Utils()

TOTAL_NUM_ARTICLES = 339521
UNKNOWN_AUTHOR_ID = 1207
AZURE_WEBSITE_IDS = {
    'GameSpot':     1,
    'Eurogamer':    2,
    'Gameplanet':   3,
    'JayIsGames':   4,
    'TIGSource':    5,
    'Indygamer':    6
}
AZURE_ARTICLE_TYPE_IDS = {
    'review': 1,
    'news': 2,
    'preview': 3,
    'feature': 4,
    'interview': 5,
    'blog': 6,
    'competition': 7,
    'face-off': 9,
    'promotion': 10,
    'podcast': 11,
    'opinion': 12,
    'video': 13,
    'guide': 14,
    'deals': 15,
    'None': 16
}


# DONE!
# def migrate_authors():
#     batch1 = sqlite_db.get_writers_to_migrate(skip=0, limit=1000)
#     batch2 = sqlite_db.get_writers_to_migrate(skip=1000, limit=1000)
    
#     azure_db.insert_writers(batch1)
#     azure_db.insert_writers(batch2)


# DONE!
# def migrate_publications():
#     websites = sqlite_db.get_websites_to_migrate()
#     azure_db.insert_publications(websites)


# DONE!
# def migrate_urls():
#     urls = sqlite_db.get_article_urls_to_migrate(skip=0, limit=1000)
    
#     articles_migrated = 1000
#     while articles_migrated < TOTAL_NUM_ARTICLES:
#         print(f'migrating {articles_migrated}...')
#         # get articles
#         urls = sqlite_db.get_article_urls_to_migrate(skip=articles_migrated, limit=1000)

#         # send to azure...
#         azure_db.insert_article_urls(urls)
#         articles_migrated += 1000


# DONE!
# def migrate_article_types():
#     article_types = sqlite_db.get_article_types_to_migrate()
#     azure_db.insert_article_types(article_types)


# DONE!
# def migrate_articles():
#     num_articles_migrated = 0

#     while True:
#         print(f'batch {num_articles_migrated}/{335-57}...')
#         # get articles to migrate
#         articles = sqlite_db.get_articles_to_migrate(limit=1000)

#         # if we get no articles back, we're done
#         if(len(articles) == 0):
#             return

#         # check for null writers
#         for article in articles:
#             if article['author'] == None:
#                 article['author'] = 'UNKNOWN'

#         # get all the unique authors, websites, and urls
#         article_authors = []
#         article_websites = []
#         article_urls = []
#         for article in articles:
#             # track author
#             if article['author'] not in article_authors:
#                 article_authors.append(article['author'])
#             # track website
#             if article['website'] not in article_websites:
#                 article_websites.append(article['website'])
#             # track urls
#             article_urls.append(article['url'])

#         # get corresponding IDs in Azure DB
#         article_author_ids  = azure_db.get_author_id_lookup(article_authors)
#         article_url_ids = azure_db.get_url_id_lookup(article_urls)

#         # and add ids to article info
#         for article in articles:
#             article['author_id'] = article_author_ids[article['author']]
#             article['url_id'] = article_url_ids[article['url']]
#             article['publication_id'] = AZURE_WEBSITE_IDS[article['website']]
#             article['type_id'] = AZURE_ARTICLE_TYPE_IDS[article['type']]
#             # clean up title and subtitle
#             article['title'] = article['title'].replace("'", "''")
#             article['subtitle'] = article['subtitle'].replace("'", "''")

#             # if subtitle is too long, just truncate and slap an ellipses on it
#             if(len(article['subtitle']) > 250):
#                 truncate_index = 246
#                 # if we're truncating an apostophe, it will cause string parsing issues...back up until we're safe
#                 while article['subtitle'][truncate_index] == "'":
#                     truncate_index -= 1
#                 # and truncate
#                 article['subtitle'] = f"{article['subtitle'][:truncate_index]}..."

#         # send to azure
#         azure_db.insert_articles(articles)

#         # and mark as migrated in sqlite
#         urls = []
#         for article in articles:
#             urls.append(article['url'])
#         sqlite_db.mark_articles_as_migrated(urls)

#         num_articles_migrated += 1


# def migrate_tags():
#     tags = sqlite_db.get_tags_to_migrate()
#     azure_db.insert_tags(tags)


# DONE!
# def migrate_article_tags():
#     azure_tag_id_lookup = azure_db.get_tag_ids_lookup()
#     article_tags_migrated = 1000
#     total_num_article_tags = 10170

#     while article_tags_migrated < total_num_article_tags:
#         print(f'migrating batch {article_tags_migrated / 1000} / {total_num_article_tags / 1000}')
#         # get next batch of article tags
#         article_tags = sqlite_db.get_article_tags_to_migrate(article_tags_migrated, 1000)

#         # parse urls into list
#         urls = []
#         for article_tag in article_tags:
#             url = article_tag['article_url']
#             if url not in urls:
#                 urls.append(url)

#         # build our article ids
#         article_ids = azure_db.get_article_ids_lookup_from_urls(urls)        

#         # and update our article_tags data to include azure ids
#         for article_tag in article_tags:
#             article_id = article_ids[article_tag['article_url']]
#             tag_id = azure_tag_id_lookup[article_tag['tag']]

#             article_tag['article_id'] = article_id
#             article_tag['tag_id'] = tag_id
#             article_tag['hash_id'] = f'{article_id}_{tag_id}'

#         # and send to azure
#         azure_db.insert_article_tags(article_tags)
#         article_tags_migrated += 1000



# NOTE: Something broken here. Need to just delete all the thumbnails and try again (it's looping forever but i don't know why...)
def migrate_thumbnails():
    num_articles_migrated = 0
    urls_seen = set()

    while True:
        print(f'batch {num_articles_migrated}/287...')
        # get thumbnails to migrate
        thumbnails = sqlite_db.get_thumbnails_to_migrate(skip=num_articles_migrated * 1000, limit=1000)

        for thumbnail in thumbnails:
            if thumbnail['url'] in urls_seen:
                print(f"ERROR: seen url '{thumbnail['url']}' twice...aborting")
            else:
                urls_seen.add(thumbnail['url'])

        # if we get no thumbnails back, we're done
        if(len(thumbnails) == 0):
            return

        # get all urls
        urls = []
        for thumbnail in thumbnails:
            urls.append(thumbnail['url'])

        # build our article ids
        article_ids = azure_db.get_article_ids_lookup_from_urls(urls)

        # and track in our dictionary
        for thumbnail in thumbnails:
            thumbnail['article_id'] = article_ids[thumbnail['url']]

        # send to azure
        azure_db.insert_thumbnails(thumbnails)

        # and mark as migrated in sqlite
        sqlite_db.mark_thumbnails_as_migrated(thumbnails)

        num_articles_migrated += 1



if __name__ == '__main__':
    migrate_thumbnails()
    print('done')