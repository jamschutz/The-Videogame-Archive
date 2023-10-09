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


def get_cleaned_token(filename):
    file_ext_length = len('.yml')
    return ''.join(ch for ch in filename[:-file_ext_length] if ch.isalnum())



token_files = [f for f in listdir(WORD_DIR) if isfile(join(WORD_DIR, f))]

for f in token_files[-100:]:
    cleaned_token = get_cleaned_token(f)
    if(len(cleaned_token) == 0):
        print(f'----DELETED: {f}')
    else:
        print(f'{f} ---> {cleaned_token}')
