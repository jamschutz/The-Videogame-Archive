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
from datetime import datetime

from Entities.Article import Article

class SearchIndexer:
    def __init__(self):
        self.config = Config()
        self.utils = Utils()
        self.tempdir = Path(tempfile.gettempdir()) / 'vga-search'

        # just in case there's junk data from a previous session, clear temp dir
        if self.tempdir.is_dir():
            shutil.rmtree(self.tempdir)
        


    def stage_article_indexes(self, article, article_text):
        # get indexes for words
        words = self.__get_search_entries(article.title, article.id, {})
        words = self.__get_search_entries(article.subtitle, article.id, words)
        words = self.__get_search_entries(article_text, article.id, words)

        # ensure directory exists
        Path(self.tempdir).mkdir(exist_ok=True)

        # and save search entries to disk
        for word in words.keys():
            with open(self.tempdir / f'{word}.yml', 'a') as f:
                yaml.dump([article.id], f, default_flow_style=False)



    def send_search_indexes_to_storage(self):
        # get all files (ignore directories) in our temp directory
        index_files = [f for f in listdir(self.tempdir) if isfile(join(self.tempdir, f))]
        api_url = f'{self.config.SEARCH_API_BASE_URL}/{self.config.INSERT_SEARCH_ENTRIES_API}'

        counter = 1
        total_files = len(index_files)
        batch_size = 50
        offset = 0

        request = []
        for f in index_files:
            # parse search term and its entries
            search_term = f[:f.find('.yml')]
            article_ids = yaml.safe_load((self.tempdir / f).read_text())

            request.append({
                'searchTerm': search_term,
                'articleIds': article_ids
            })

            # send to api
            if counter > batch_size:
                print(f'sending indexes [{counter + offset} / {total_files}]...')
                requests.post(api_url, json=request)
                offset += batch_size
                counter = 0
                request = []

            counter += 1

        # send last bit of data over
        if len(request) > 0:
            requests.post(api_url, json=request)

        # delete temp directory
        shutil.rmtree(self.tempdir)


    def __get_search_entries(self, text, article_id, words):
        word = ""
        for c in text:
            if c == ' ' or c == '\n':
                words = self.__add_to_words(word, words)                
                word = ""
            else:
                word += c

        words = self.__add_to_words(word, words)
        return words
    

    def __add_to_words(self, word, words):
        word = word.lower()
        word = self.utils.trim_punctuation(word)
        if len(word) > 0:
            if word not in words:
                words[word] = True

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