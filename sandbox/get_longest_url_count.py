import os, json

ROOT_DIR = '/_WaybackMachineDumps/GameSpot/firstpass'

def get_files():
    try:
        files_in_dir = os.listdir(ROOT_DIR)
        return files_in_dir
    except:
        return []


def get_longest_url_in_file(filename):
    longest_url = 0
    with open(f'{ROOT_DIR}/{filename}', 'r', encoding='cp932', errors='ignore') as json_file:
        data = json.load(json_file)

        for url in data:
            longest_url = len(url['url']) if len(url['url']) > longest_url else longest_url

    return longest_url


files = get_files()
best = 0
for f in files:
    print(f'looking in {f}...')
    longest = get_longest_url_in_file(f)
    best = longest if longest > best else best

print(best)