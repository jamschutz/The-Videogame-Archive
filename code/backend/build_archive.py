import json, time
from pathlib import Path
from datetime import datetime

# DATETIME_FORMAT = '%A, %b %d, %Y %I:%M%p'
# DATETIME_FORMAT = '%m/%d/%Y'


# load sitemap
sitemap = []
with open('../../archive/_sitemaps/GameSpot_SORTED.json') as f:
    sitemap = json.load(f)
    

# for each article, convert string to datetime
# for article in sitemap:
#     article['date'] = datetime.strptime(article['date'], DATETIME_FORMAT)


# sort by date
sitemap = sorted(sitemap, key=lambda d: d['date'])

full_archive = {}
for article in sitemap:
    year  = article['date'].split('/')[2]
    month = article['date'].split('/')[0]
    day   = article['date'].split('/')[1]

    if year not in full_archive:
        full_archive[year] = {}
    if month not in full_archive[year]:
        full_archive[year][month] = {}
    if day not in full_archive[year][month]:
        full_archive[year][month][day] = []

    full_archive[year][month][day].append(article)

# for each article, convert datetime back to string (so it saves okay)
# for article in sitemap:
#     article['date'] = article['date'].strftime('%m/%d/%Y')

# write to file
with open("../../archive/_fullArchive/archive.json", "w") as json_file:
    json.dump(full_archive, json_file)