from Core.Config import Config
from Core.Utils import Utils
from Entities.Article import Article
from Core.DB.ArticlesManager import ArticlesManager
from Core.DB.WebsitesManager import WebsitesManager
from ..Eurogamer.helpers.utils import get_next_month, get_article_date

import logging
import requests
from datetime import datetime
from bs4 import BeautifulSoup

# for sitemaps
from dateutil import parser



class UrlIndexerIGN:
    
    def __init__(self):
        self.website_name = 'IGN'
        self.articles_manager = ArticlesManager()
        self.config = Config()
        self.utils = Utils()

        self.website_id = WebsitesManager().get_id(self.website_name)


    def add_urls_from_sitemap(self, sitemap_filename):
        xml = ''
        with open(sitemap_filename, 'r') as file:
            xml = file.read()
        
        article_data = BeautifulSoup(xml, 'xml').find_all('url')
        print(f'got {len(article_data)} urls')

        articles = []
        for article in article_data:
            # check if there's a date in the url, and if so, take that...
            url = article.find('loc').text
            date = self.get_date_from_url(url)
            if date is None:
                raw_date = article.find('lastmod').text
                raw_date = parser.parse(raw_date)
                date = raw_date.year * 10000 + raw_date.month * 100 + raw_date.day

            articles.append(Article(
                url=url,
                date=date
            ))

        return articles


    def get_date_from_url(self, url):
        # url is in format: https://www.ign.com/articles/2009/09/10/unwritten-5-review
        start_index = len('https://www.ign.com/articles/')
        end_index = start_index + len('2009/09/10/')

        url_snippet = url[start_index:end_index]

        # should be exactly 3 '/'
        if url_snippet.count('/') != 3:
            return None
        
        # slashes should be right after year, month, and day
        if url_snippet[4] != '/' or url_snippet[7] != '/' or url_snippet[10] != '/':
            print('returning...')
            return None
        
        # try and parse the int...
        try:
            year = int(url_snippet[:4])
            month = int(url_snippet[5:7])
            day = int(url_snippet[8:10])

            return year * 10000 + month * 100 + day

        except:
            return None
        
            


        



if __name__ == '__main__':
    ign = UrlIndexerIGN()
    sitemaps = [
        '/_sandbox/ign-sitemaps/sitemap-ign-article-current.xml/sitemap-ign-article-current.xml'
    ]

    for sitemap in sitemaps:
        articles = ign.add_urls_from_sitemap(sitemap)
        print([a.to_string() for a in articles])