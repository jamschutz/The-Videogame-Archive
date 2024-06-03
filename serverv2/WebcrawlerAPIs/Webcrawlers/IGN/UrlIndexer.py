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
                date=date,
                # we will get the actual values for these when we archive them -- for now, just put down whatever so we can insert non-null values into the db!
                type = 'news',
                author =  self.config.PLACEHOLDER_AUTHOR_NAME,
                website_id = self.website_id
            ))

        skip = 0
        take = 1000
        while skip < len(articles):
            print(f'inserting articles [{skip} / {len(articles)}]...')
            self.articles_manager.insert_articles(articles[skip:skip + take])
            skip += take


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
        # '/_sandbox/ign-sitemaps/sitemap-ign-article-5deef8ad72718e6109f96d18.xml/sitemap-ign-article-5deef8ad72718e6109f96d18.xml',
        '/_sandbox/ign-sitemaps/sitemap-ign-article-5deef75a72718e6109f6df4d.xml/sitemap-ign-article-5deef75a72718e6109f6df4d.xml',
        '/_sandbox/ign-sitemaps/sitemap-ign-article-5deef99f72718e6109faf3b7.xml/sitemap-ign-article-5deef99f72718e6109faf3b7.xml',
        '/_sandbox/ign-sitemaps/sitemap-ign-article-5deefa0a72718e6109fd3da5.xml/sitemap-ign-article-5deefa0a72718e6109fd3da5.xml',
        '/_sandbox/ign-sitemaps/sitemap-ign-article-5deefaf372718e6109ff6515.xml/sitemap-ign-article-5deefaf372718e6109ff6515.xml',
        '/_sandbox/ign-sitemaps/sitemap-ign-article-5deefb6372718e6109009f7b.xml/sitemap-ign-article-5deefb6372718e6109009f7b.xml',
        '/_sandbox/ign-sitemaps/sitemap-ign-article-5deefc3d72718e61090162cc.xml/sitemap-ign-article-5deefc3d72718e61090162cc.xml',
        '/_sandbox/ign-sitemaps/sitemap-ign-article-5ebbc03c72718e61090240b2.xml/sitemap-ign-article-5ebbc03c72718e61090240b2.xml'
    ]

    for sitemap in sitemaps:
        ign.add_urls_from_sitemap(sitemap)

    # arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    # skip = 0
    # take = 3
    # while skip < len(arr):
    #     print(arr[skip:skip + take])
    #     skip += take