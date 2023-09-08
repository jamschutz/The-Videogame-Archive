from server._shared.AzureDbManager import AzureDbManager
import re, string
import nltk
from nltk.stem import WordNetLemmatizer
from nltk.corpus import wordnet

regex = re.compile('[%s]' % re.escape(string.punctuation))
db = AzureDbManager()
lemmatizer = WordNetLemmatizer()

STRING_TYPE_TITLE = 0
STRING_TYPE_SUBTITLE = 1

search_term_indices = {}
total_article_count = int(db.get_total_article_count()[0][0])

print(string.punctuation)

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
    return [regex.sub('', token) for token in tokens]

def lowercase_filter(tokens):
    return [token.lower() for token in tokens]

def tokenize(text):
    tokens = []
    token = ""
    for c in text:
        if c == ' ':
            tokens.append(token)
            token = ''
        else:
            token += c
    tokens.append(token)

    # apply filters
    tokens = lowercase_filter(tokens)
    tokens = punctuation_filter(tokens)
    tokens = stem_filter(tokens)
    return tokens

def store_search_term_indices(text, string_type):
    tokens = tokenize(text)
    print(tokens)

articles_to_index = db.get_top_articles(0, 100)
for article in articles_to_index:
    article_id = article[0]
    title = article[1]
    subtitle = article[2]

    # print(f'id: {article_id}, title: {title}, subtitle: {subtitle}')

    store_search_term_indices(title, STRING_TYPE_TITLE)


