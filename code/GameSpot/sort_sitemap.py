import json, time
from pathlib import Path
from datetime import datetime

DATETIME_FORMAT = '%A, %b %d, %Y %I:%M%p'


# load sitemap
sitemap = []
with open('../../archive/_sitemaps/GameSpot.json') as f:
    sitemap = json.load(f)
    

# for each article, convert string to datetime
for article in sitemap:
    article['date'] = datetime.strptime(article['date'], DATETIME_FORMAT)


# sort by date
sitemap = sorted(sitemap, key=lambda d: d['date']) 

# for each article, convert datetime back to string (so it saves okay)
for article in sitemap:
    article['date'] = article['date'].strftime('%m/%d/%Y')

# write to file
with open("../../archive/_sitemaps/GameSpot_SORTED.json", "w") as json_file:
    json.dump(sitemap, json_file)