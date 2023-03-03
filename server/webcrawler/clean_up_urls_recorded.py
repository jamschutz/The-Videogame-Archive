import json

ARCHIVE_FOLDER_PATH = '../data/_archive/'
WEBSITE_ARCHIVE_PATH = '../website/data/'


START_YEAR = 1996
END_YEAR = 2023


def remove_bad_entries(year):
    year_articles = {}
    with open(f'{ARCHIVE_FOLDER_PATH}{str(year)}.json') as f:
        year_articles = json.load(f)

    for month in year_articles:
        for day in year_articles[month]:
            year_articles[month][day] = [item for item in year_articles[month][day] if item['url'][0] != '/']

    # print(year_articles)
    with open(f'{ARCHIVE_FOLDER_PATH}{str(year)}.json', 'w') as f:
        json.dump(year_articles, f)

    with open(f'{WEBSITE_ARCHIVE_PATH}{str(year)}.json', 'w') as f:
        json.dump(year_articles, f)


y = START_YEAR
while y <= END_YEAR:
    print(f'cleaning up {y}...')
    remove_bad_entries(y)
    y += 1


#     for url in urls_recorded:
#         if url[0] == "/":
#             bad_entries.append(url)

#     for bad_url in bad_urls:
#         del urls_recorded[bad_url]

#     with open(f'{ARCHIVE_FOLDER_PATH}urls_recorded.json', "w") as f:
#         json.dump(urls_recorded, f)
#     print(f'number of bad urls removed: {len(bad_urls)}')


# urls_recorded = {}
# with open(f'{ARCHIVE_FOLDER_PATH}urls_recorded.json') as f:
#     urls_recorded = json.load(f)


# bad_urls = []
# good_urls = 0
# for url in urls_recorded:
#     if url[0] == "/":
#         bad_urls.append(url)
#     else:
#         good_urls += 1


# print(f'number of pages indexed: {good_urls}')

# for bad_url in bad_urls:
#     del urls_recorded[bad_url]

# with open(f'{ARCHIVE_FOLDER_PATH}urls_recorded.json', "w") as f:
#     json.dump(urls_recorded, f)
# print(f'number of bad urls removed: {len(bad_urls)}')