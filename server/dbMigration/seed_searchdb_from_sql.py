from server._shared.AzureDbManager import AzureDbManager
import re, string
import nltk
from nltk.stem import WordNetLemmatizer
from nltk.corpus import wordnet
import requests
import json


regex = re.compile('[%s]' % re.escape(string.punctuation))
db = AzureDbManager()
lemmatizer = WordNetLemmatizer()

STRING_TYPE_TITLE = 0
STRING_TYPE_SUBTITLE = 1

TOTAL_ARTICLE_COUNT = 339521

TITLE_POS_OFFSET = -100
SUBTITLE_POS_OFFSET = -10000

INSERT_SEARCH_TERMS_URL = 'http://localhost:7070/api/InsertSearchResults'

search_term_indices = {}
total_article_count = int(db.get_total_article_count()[0][0])

def get_wordnet_pos(word):
    # map POS tag to first character lemmatize() accepts
    tag = nltk.pos_tag([word])[0][1][0].lower()
    tag_dict = {"a": wordnet.ADJ,
                "n": wordnet.NOUN,
                "v": wordnet.VERB,
                "r": wordnet.ADV}
    return tag_dict.get(tag, wordnet.NOUN)

def stem_filter(tokens):
    return [lemmatizer.lemmatize(token, pos=get_wordnet_pos(token)) for token in tokens]

def punctuation_filter(tokens):
    for token in tokens:
        token['token'] = regex.sub('', token['token'])
    # return [regex.sub('', token['token']) for token in tokens]
    return tokens

def lowercase_filter(tokens):
    for token in tokens:
        token['token'] = token['token'].lower()
    return tokens
    # return [token['token'].lower() for token in tokens]

def tokenize(text, string_type):
    tokens = []
    token = ""
    start_pos = 0
    current_pos = 0
    pos_offset = TITLE_POS_OFFSET if string_type == STRING_TYPE_TITLE else SUBTITLE_POS_OFFSET
    for c in text:
        if c in [' ', '\n', '\t', '\r']:
            tokens.append({
                'token': token,
                'start_pos': pos_offset - start_pos
            })
            token = ''
            start_pos = current_pos + 1
        else:
            token += c
        current_pos += 1

    tokens.append({
        'token': token,
        'start_pos': pos_offset - start_pos
    })

    # apply filters
    tokens = lowercase_filter(tokens)
    tokens = punctuation_filter(tokens)
    return tokens


def store_search_term_indices(article_id, text, string_type):
    tokens = tokenize(text, string_type)
    for t in tokens:
        token = t['token']
        start_pos = t['start_pos']
        if token not in search_term_indices:
            search_term_indices[token] = {
                'articleIds': [],
                'startPositions': []
            }
        
        search_term_indices[token]['articleIds'].append(article_id)
        search_term_indices[token]['startPositions'].append(start_pos)



def insert_search_terms(request):
    response = requests.post(INSERT_SEARCH_TERMS_URL, data=json.dumps(request))
    return response.json()


def index_articles_with_offset(skip, take):
    print(f'getting articles {skip} - {skip + take}...')
    articles_to_index = db.get_top_articles(skip, take)
    for article in articles_to_index:
        article_id = article[0]
        title = article[1]
        subtitle = article[2]

        store_search_term_indices(article_id, title, STRING_TYPE_TITLE)

    insert_search_request = []
    for search_term in search_term_indices:
        results = search_term_indices[search_term]

        insert_search_request.append ({
            'searchTerm': search_term,
            'articleIds': results['articleIds'],
            'startPositions': results['startPositions']
        })


    with open('last_request.json', 'w') as f:
        json.dump(insert_search_request, f)
    response = insert_search_terms(insert_search_request)
    with open('last_response.json', 'w') as f:
        json.dump(response, f)


current_offset = 47000
num_to_index = 1000
while current_offset <= TOTAL_ARTICLE_COUNT:
    index_articles_with_offset(current_offset, num_to_index)
    current_offset += num_to_index
