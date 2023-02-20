import json, time
from pathlib import Path
from datetime import datetime

BASE_URL = 'https://www.gamespot.com'
DATA_DUMP_FILE = '../data/_dumps/GameSpot_news_08281999-05172006.json'
ARCHIVE_FOLDER_PATH = '../data/_archive/'


# load sitemap
data_dump = []
with open(DATA_DUMP_FILE) as f:
    data_dump = json.load(f)


# sort by date
articles = sorted(data_dump, key=lambda d: d['date'])

# add articles to records
full_archive = {}
full_archive['urls_recorded'] = set()
for article in articles:
    year  = article['date'].split('/')[2]
    month = article['date'].split('/')[0]
    day   = article['date'].split('/')[1]

    article['url'] = f"{BASE_URL}{article['url']}"
    article['website'] = 'GameSpot'
    article['type'] = 'news'

    if year not in full_archive:
        full_archive[year] = []
    
    # don't add the same article twice
    if article['url'] in full_archive['urls_recorded']:
        print(f'skipping {article["title"]} because it was already recorded')
        continue

    # otherwise, add the article
    full_archive[year].append(article)
    full_archive['urls_recorded'].add(article['url'])


for year, articles in full_archive.items():
    # not a real year...
    if year == 'urls_recorded':
        continue

    print(f'got {len(articles)} records for {year}')

    formatted_records = {}
    for article in articles:
        month = article['date'].split('/')[0]
        day   = article['date'].split('/')[1]

        if month not in formatted_records:
            formatted_records[month] = {}
        if day not in formatted_records[month]:
            formatted_records[month][day] = []

        formatted_records[month][day].append(article)

    with open(f'{ARCHIVE_FOLDER_PATH}{year}.json', "w") as f:
        json.dump(formatted_records, f)


    

# load current archive
# current_archive = {}
# with open("../data/_archive/archive.json", "r") as f:
#     current_archive = json.loads(f)

# print(current_archive)

# full_archive = {}
# for article in sitemap:
#     year  = article['date'].split('/')[2]
#     month = article['date'].split('/')[0]
#     day   = article['date'].split('/')[1]

#     if year not in full_archive:
#         full_archive[year] = {}
#     if month not in full_archive[year]:
#         full_archive[year][month] = {}
#     if day not in full_archive[year][month]:
#         full_archive[year][month][day] = []

#     full_archive[year][month][day].append(article)

# for each article, add full url
# for article in sitemap:
#     article['url'] = f"{BASE_URL}{article['url']}"
#     article['website'] = 'GameSpot'
#     article['type'] = 'news'

# # write to file
# with open("../data/_fullArchive/archive.json", "w") as json_file:
#     json.dump(full_archive, json_file)