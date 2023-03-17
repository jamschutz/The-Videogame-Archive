import sqlite3

TARGET_WEBSITE_NAME = 'GameSpot'
TARGET_WEBISTE_ID = 1
BATCH_SIZE = 1000

def get_query(query):
    # connect to db, and fetch
    db = sqlite3.connect('/_database/VideogamesDatabase.db')
    cursor = db.cursor()
    result = cursor.execute(query)
    result = result.fetchall()
    db.close()

    return result


def get_articles(offset):
    query = f"""
        SELECT
            Id, Url, DatePublished
        FROM
            Article
        WHERE
            WebsiteId = {TARGET_WEBISTE_ID}
        LIMIT {BATCH_SIZE} OFFSET {offset}
    """
    result = get_query(query)

    articles = []
    for article in result:
        articles.append({
            'id': article[0],
            'url': article[1],
            'date': article[2]
        })

    return articles


for i in range(2):
    print(get_articles(i * BATCH_SIZE))