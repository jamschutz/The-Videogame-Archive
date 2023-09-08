from server._shared.AzureDbManager import AzureDbManager
# import Stemmer
import re
import string

# STEMMER = Stemmer.Stemmer('english')
PUNCTUATION = re.compile('[%s]' % re.escape(string.punctuation))
db = AzureDbManager()

STRING_TYPE_TITLE = 0
STRING_TYPE_SUBTITLE = 1

search_term_indices = {}
total_article_count = int(db.get_total_article_count()[0][0])


def store_search_term_indices(text, string_type):
    tokens = []
    token = ""
    for c in text:
        if c == ' ':
            tokens.append(token)
            token = ''
        else:
            token += c
    tokens.append(token)

    print(tokens)

def tokenize(text):
    return text.split()

def lowercase_filter(tokens):
    return [token.lower() for token in tokens]

articles_to_index = db.get_top_articles(0, 20)
for article in articles_to_index:
    article_id = article[0]
    title = article[1]
    subtitle = article[2]

    # print(f'id: {article_id}, title: {title}, subtitle: {subtitle}')

    store_search_term_indices(title, STRING_TYPE_TITLE)

# def stem_filter(tokens):
#     return STEMMER.stemWords(tokens)

# def punctuation_filter(tokens):
#     return [PUNCTUATION.sub('', token) for token in tokens]


