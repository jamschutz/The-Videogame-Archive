from server._shared.AzureDbManager import AzureDbManager
import re, string
import nltk
from nltk.stem import WordNetLemmatizer
from nltk.corpus import wordnet
import requests
import json
import yaml
from pathlib import Path
from os import listdir
from os.path import isfile, join

regex = re.compile('[%s]' % re.escape(string.punctuation))
db = AzureDbManager()
lemmatizer = WordNetLemmatizer()

STRING_TYPE_TITLE = 0
STRING_TYPE_SUBTITLE = 1

TOTAL_ARTICLE_COUNT = 339521

TITLE_POS_OFFSET = -100
SUBTITLE_POS_OFFSET = -10000

INSERT_SEARCH_TERMS_URL = 'http://localhost:7070/api/InsertSearchResults'

WORD_DIR = '/The Videogame Archive/server/dbMigration/searchResults'


# ------- THIS IS HOW TO LOAD ---------------- #
# entries = yaml.safe_load(Path(f'{WORD_DIR}/review.yml').read_text())
# print(entries)


def insert_search_term(request):
    response = requests.post(INSERT_SEARCH_TERMS_URL, data=json.dumps(request))
    return response.json()


def get_cleaned_token(filename):
    file_ext_length = len('.yml')
    return ''.join(ch for ch in filename[:-file_ext_length] if ch.isalnum())


print('loading file list...')
token_files = [f for f in listdir(WORD_DIR) if isfile(join(WORD_DIR, f))]

skip_amount = 58300
count = 1

for f in token_files[skip_amount:]:
    print(f'inserting for {f} ({count + skip_amount} of {len(token_files)})...')
    # clean up token (remove non alphanumerics)
    cleaned_token = get_cleaned_token(f)
    if(len(cleaned_token) == 0):
        print(f'----DELETED: {f}')
        continue

    entries = yaml.safe_load(Path(f'{WORD_DIR}/{f}').read_text())
    insert_search_term({
        'searchTerm': cleaned_token,
        'entries': entries
    })
    count += 1
    # with open('insertSearchResults.json', 'w', encoding='utf-8') as f:
    #     json.dump(insert_search_request, f, ensure_ascii=False, indent=4)
