import json, time
from pathlib import Path
from datetime import datetime

# if you change the below!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
DATA_DUMP_FILE = '../../data/_dumps/Eurogamer_02-2023_02-2023.json'
# DATA_DUMP_FILE_TYPE = 'review'
# change the above too!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
ARCHIVE_FOLDER_PATH = '../../data/_archive/'
WEBSITE_ARCHIVE_PATH = '../../website/data/'


# load sitemap
data_dump = []
with open(DATA_DUMP_FILE) as f:
    data_dump = json.load(f)

urls_recorded = {}
with open(f'{ARCHIVE_FOLDER_PATH}urls_recorded.json') as f:
    urls_recorded = json.load(f)



# sort by date
articles = sorted(data_dump, key=lambda d: d['date'])

# add articles to records
full_archive = {}
full_archive['urls_recorded'] = set()
for article in articles:
    # already recorded this article, skip it
    if article['url'] in urls_recorded:
        continue

    year  = article['date'].split('/')[2]
    month = article['date'].split('/')[0]
    day   = article['date'].split('/')[1]

    # article['url'] = f"{BASE_URL}{article['url']}"
    # article['type'] = DATA_DUMP_FILE_TYPE

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

    """
    format things so the layout looks like:
        {
            "01": {
                "10": [
                    {
                        "title": "some article, etc" ...
                    }
                ]
            }
        }
    """
    formatted_records = {}
    # if we already have records for this year, grab them
    if Path(f'{ARCHIVE_FOLDER_PATH}{year}.json').exists():
        with open(f'{ARCHIVE_FOLDER_PATH}{year}.json') as f:
            formatted_records = json.load(f)
            print(f'found existing records for year {year}')

    for article in articles:
        month = article['date'].split('/')[0]
        day   = article['date'].split('/')[1]

        # make sure that the keys are in the dictionary
        if month not in formatted_records:
            formatted_records[month] = {}
        if day not in formatted_records[month]:
            formatted_records[month][day] = []

        # add article to records
        urls_recorded[article['url']] = True
        formatted_records[month][day].append(article)

    # save formatted records to YEAR.json
    with open(f'{ARCHIVE_FOLDER_PATH}{year}.json', "w") as f:
        json.dump(formatted_records, f)

    # also save a record on the website
    with open(f'{WEBSITE_ARCHIVE_PATH}{year}.json', "w") as f:
        json.dump(formatted_records, f)

# and finally, update list of urls recorded
with open(f'{ARCHIVE_FOLDER_PATH}urls_recorded.json', "w") as f:
    json.dump(urls_recorded, f)
