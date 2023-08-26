import json


def get_articles(articles, year, month, day):
    date_articles = {
        'year': year,
        'month': month,
        'day': day,
        'articles': {
            'GameSpot': [],
            'Eurogamer': [],
            'Gameplanet': [],
            'Indygamer': [],
            'JayIsGames': [],
            'TIGSource': []
        }
    }

    for article in articles:
        date_articles['articles'][article['website']].append({
            'title': article['title'],
            'subtitle': article['subtitle'],
            'author': article['author'],
            'thumbnail': article['thumbnail'],
            'url': article['url'],
            'type': article['type']
        })

    return date_articles

articles_10 = []
articles_11 = []
articles_12 = []
articles_13 = []
articles_14 = []
articles_15 = []
articles_16 = []
with open('dev_articles_20001010.json') as f:
    articles_10 = json.load(f)
with open('dev_articles_20001011.json') as f:
    articles_11 = json.load(f)
with open('dev_articles_20001012.json') as f:
    articles_12 = json.load(f)
with open('dev_articles_20001013.json') as f:
    articles_13 = json.load(f)
with open('dev_articles_20001014.json') as f:
    articles_14 = json.load(f)
with open('dev_articles_20001015.json') as f:
    articles_15 = json.load(f)
with open('dev_articles_20001016.json') as f:
    articles_16 = json.load(f)

output = []
output.append(get_articles(articles_10, 2000, 10, 10))
output.append(get_articles(articles_11, 2000, 10, 11))
output.append(get_articles(articles_12, 2000, 10, 12))
output.append(get_articles(articles_13, 2000, 10, 13))
output.append(get_articles(articles_14, 2000, 10, 14))
output.append(get_articles(articles_15, 2000, 10, 15))
output.append(get_articles(articles_16, 2000, 10, 16))

with open('dev_articles_output.json', 'w') as f:
    f.write(json.dumps(output))