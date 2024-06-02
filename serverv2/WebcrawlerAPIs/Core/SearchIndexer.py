from .Config import Config
from .Utils import Utils

# for testing
from bs4 import BeautifulSoup
from pathlib import Path
from os import listdir, remove
from os.path import isfile, join
import requests
import tempfile
import yaml
import shutil

from Entities.Article import Article

class SearchIndexer:
    def __init__(self):
        self.config = Config()
        self.utils = Utils()
        self.tempdir = Path(tempfile.gettempdir()) / 'vga-search'

        # just in case there's junk data from a previous session, clear temp dir
        shutil.rmtree(self.tempdir)
        


    def stage_article_indexes(self, article, article_text):
        # get indexes for words
        words = self.__get_search_entries(article.title, article.id, {}, text_type='title')
        words = self.__get_search_entries(article.subtitle, article.id, words, text_type='subtitle')
        words = self.__get_search_entries(article_text, article.id, words, text_type='content')

        # ensure directory exists
        Path(self.tempdir).mkdir(exist_ok=True)

        # and save search entries to disk
        for word in words.keys():
            with open(self.tempdir / f'{word}.yml', 'a') as f:
                yaml.dump(words[word], f, default_flow_style=False)



    def send_search_indexes_to_storage(self):
        # get all files (ignore directories) in our temp directory
        index_files = [f for f in listdir(self.tempdir) if isfile(join(self.tempdir, f))]
        api_url = f'{self.config.SEARCH_API_BASE_URL}/{self.config.INSERT_SEARCH_ENTRIES_API}'

        counter = 1
        total_files = len(index_files)
        for f in index_files:
            print(f'sending indexes for {f} [{counter} / {total_files}]...')

            # parse search term and its entries
            search_term = f[:f.find('.yml')]
            entries = yaml.safe_load((self.tempdir / f).read_text())

            # send to api
            data = {
                'searchTerm': search_term,
                'entries': entries
            }
            requests.post(api_url, json=data)
            counter += 1

        # delete temp directory
        shutil.rmtree(self.tempdir)

        



    def index_article(self, article_text, article):
        index = 0
        word = ""
        words = {}
        for c in article_text:
            if c == ' ' or c == '\n':
                start_index = index - len(word)
                word = word.lower()
                word = self.utils.trim_punctuation(word)
                if len(word) > 0:
                    if word not in words:
                        words[word] = []
                    
                    words[word].append({
                        'articleId': article_id,
                        'startPosition': start_index
                    })
                
                word = ""

            else:
                word += c

            index += 1

        if len(word) > 0:
            start_index = index - len(word)
            word = self.utils.trim_punctuation(word)
            if len(word) > 0:
                if word not in words:
                    words[word] = []
                
                words[word].append(start_index)

        print(f'num words: {len(words.keys())}')
        url = f'{self.config.SEARCH_API_BASE_URL}/{self.config.INSERT_SEARCH_ENTRIES_API}'
        for search_term in words.keys():
            print(f'inserting entries for: {search_term}')
            data = {
                'searchTerm': search_term,
                'entries': words[search_term]
            }
            requests.post(url, json=data)


    # text type can be 'content', 'title', or 'subtitle'
    def __get_search_entries(self, text, article_id, words, text_type='content'):
        offset = 0
        if text_type == 'title':
            offset = -100
        elif text_type == 'subtitle':
            offset = -1000

        index = 0
        word = ""
        for c in text:
            if c == ' ' or c == '\n':
                start_index = index - len(word)
                words = self.__add_to_words(start_index, offset, word, words)                
                word = ""

            else:
                word += c

            index += 1

        words = self.__add_to_words(start_index, offset, word, words)
        return words
    

    def __add_to_words(self, start_index, offset, word, words):
        word = word.lower()
        word = self.utils.trim_punctuation(word)
        if len(word) > 0:
            if word not in words:
                words[word] = []
            
            words[word].append({
                'articleId': article_id,
                'startPosition': offset - start_index if offset < 0 else start_index
            })

        return words





if __name__ == '__main__':
    search_indexer = SearchIndexer()

    url = 'https://www.eurogamer.net/crunch-once-again-in-the-spotlight-after-damning-report-on-the-last-of-us-2-developer-naughty-dog'
    article_id = 260115
    source = requests.get(url).text
    soup = BeautifulSoup(source, 'lxml')
    paragraphs = soup.find('div', class_="article_body_content").find_all('p')

    article_text = ""
    for paragraph in paragraphs:
        article_text += f' {paragraph.text}'

    article = Article(
        id=260115,
        title='Crunch once again in the spotlight after damning report on The Last of Us 2 developer Naughty Dog',
        subtitle='"One good friend of mine was hospitalised... due to overwork."'
    )

    search_indexer.stage_article_indexes(article, article_text)
    search_indexer.send_search_indexes_to_storage()