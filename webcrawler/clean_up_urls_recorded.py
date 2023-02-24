import json

ARCHIVE_FOLDER_PATH = '../data/_archive/'

urls_recorded = {}
with open(f'{ARCHIVE_FOLDER_PATH}urls_recorded.json') as f:
    urls_recorded = json.load(f)


bad_urls = []
good_urls = 0
for url in urls_recorded:
    if url[0] == "/":
        bad_urls.append(url)
    else:
        good_urls += 1


print(f'number of pages indexed: {good_urls}')

for bad_url in bad_urls:
    del urls_recorded[bad_url]

with open(f'{ARCHIVE_FOLDER_PATH}urls_recorded.json', "w") as f:
    json.dump(urls_recorded, f)
print(f'number of bad urls removed: {len(bad_urls)}')