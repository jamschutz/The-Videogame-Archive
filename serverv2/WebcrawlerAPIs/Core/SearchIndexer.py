from .Config import Config
from .Utils import Utils

# for testing
from bs4 import BeautifulSoup
import requests

class SearchIndexer:
    def __init__(self):
        self.config = Config()
        self.utils = Utils()


    def index_article(self, article_text, article_id):
        index = 0
        word = ""
        words = {}
        for c in article_text:
            if c == ' ' or c == '\n':
                start_index = index - len(word)
                word = self.utils.trim_punctuation(word)
                if len(word) > 0:
                    if word not in words:
                        words[word] = []
                    
                    words[word].append(start_index)
                
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

        print(words)




if __name__ == '__main__':
    search_indexer = SearchIndexer()

    url = 'https://www.eurogamer.net/the-big-larian-interview-swen-vincke-on-industry-woes-optimism-and-life-after-baldurs-gate-3'
    source = requests.get(url).text
    soup = BeautifulSoup(source, 'lxml')
    paragraphs = soup.find('div', class_="article_body_content").find_all('p')

    article_text = ""
    for paragraph in paragraphs:
        article_text += f' {paragraph.text}'

    search_indexer.index_article(article_text, 0)

    print(article_text[24112:24112 + len('reminds')])