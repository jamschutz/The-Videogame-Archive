from Core.Config import Config
from Core.Utils import Utils
from Entities.Article import Article
from Core.DB.ArticlesManager import ArticlesManager
from Core.DB.WebsitesManager import WebsitesManager
from ..Eurogamer.helpers.utils import get_next_month, get_article_date

import logging
import requests
import time
from datetime import datetime, timedelta
from bs4 import BeautifulSoup

from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service

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
        


    def get_db_date_format(self, date_str):
        if 'h ago' in date_str:
            date_str = datetime.today().strftime('%b %d, %Y')
        elif 'd ago' in date_str:
            num_days_ago = int(date_str.split('d ago')[0])
            adjusted_date = datetime.today() - timedelta(days = num_days_ago)
            date_str = adjusted_date.strftime('%b %d, %Y')

        date = datetime.strptime(date_str, '%b %d, %Y')
        return date.year * 10000 + date.month * 100 + date.day
        

# NOTE: last date 5-21-2021

    def get_articles_from_html(self, raw_html, article_type):
        # parse html
        soup = BeautifulSoup(raw_html, 'lxml')

        # find all article sections (there are multiple...ugh)
        article_sections = soup.find_all('section', class_='main-content')

        # for each section, get all the articles
        article_divs = []
        for section in article_sections:
            article_divs.extend(section.find_all('a', class_='item-body'))

        # and actually parse the articles
        articles = []
        for article in article_divs:
            url = f"https://ign.com{article['href']}"
            title = article.find('span', class_='item-title').text.strip()
            subtitle = article.find('div', class_='item-subtitle').text.split(' - ')[1].strip()
            date = article.find('div', class_='item-publish-date').text.strip()

            thumbnail = article.find('div', class_='item-thumbnail').find('img')
            thumbnail_url = thumbnail['src']
            thumbnail_alt = thumbnail['alt']

            articles.append(Article(
                url=url,
                title=title,
                subtitle=subtitle,
                date=self.get_db_date_format(date),
                thumbnail_url=thumbnail_url,
                thumbnail_alt=thumbnail_alt,
                type=article_type,
                author=self.config.PLACEHOLDER_AUTHOR_ID,
                website_id=self.website_id
            ))

        return articles

        

            

    def get_latest_articles(self, web_page):
        # fetch web page
        driver = webdriver.Firefox()
        driver.get(f'https://www.ign.com/{web_page}')

        # wait for page to load, give it 2 seconds
        time.sleep(5)

        # get screen height (so we know how much to scroll)
        screen_height = driver.execute_script('return window.screen.height;')
        scroll_amount = 1000
        scroll_pause_time = 3

        # scroll down page
        num_scrolls = 1
        while True:
            # scroll
            driver.execute_script(f"window.scrollTo(0, {screen_height}*{num_scrolls});".format(screen_height=scroll_amount, i=num_scrolls))

            # wait to load
            num_scrolls += 1
            time.sleep(scroll_pause_time)

            html_source = driver.page_source            
            articles = self.get_articles_from_html(html_source.encode('utf-8'), web_page.split('/')[0])

            print([a.to_string() for a in articles])

            # # get scroll height
            # scroll_height = driver.execute_script('return window.screen.height;')

            # # if our predicted scroll height is greater than the actual, we're done scrolling
            # if screen_height * num_scrolls > scroll_height:
            #     break

        # close driver
        driver.quit()

        



if __name__ == '__main__':
    ign = UrlIndexerIGN()
    # sitemaps = [
    #     # '/_sandbox/ign-sitemaps/sitemap-ign-article-5deef8ad72718e6109f96d18.xml/sitemap-ign-article-5deef8ad72718e6109f96d18.xml',
    #     '/_sandbox/ign-sitemaps/sitemap-ign-article-5deef75a72718e6109f6df4d.xml/sitemap-ign-article-5deef75a72718e6109f6df4d.xml',
    #     '/_sandbox/ign-sitemaps/sitemap-ign-article-5deef99f72718e6109faf3b7.xml/sitemap-ign-article-5deef99f72718e6109faf3b7.xml',
    #     '/_sandbox/ign-sitemaps/sitemap-ign-article-5deefa0a72718e6109fd3da5.xml/sitemap-ign-article-5deefa0a72718e6109fd3da5.xml',
    #     '/_sandbox/ign-sitemaps/sitemap-ign-article-5deefaf372718e6109ff6515.xml/sitemap-ign-article-5deefaf372718e6109ff6515.xml',
    #     '/_sandbox/ign-sitemaps/sitemap-ign-article-5deefb6372718e6109009f7b.xml/sitemap-ign-article-5deefb6372718e6109009f7b.xml',
    #     '/_sandbox/ign-sitemaps/sitemap-ign-article-5deefc3d72718e61090162cc.xml/sitemap-ign-article-5deefc3d72718e61090162cc.xml',
    #     '/_sandbox/ign-sitemaps/sitemap-ign-article-5ebbc03c72718e61090240b2.xml/sitemap-ign-article-5ebbc03c72718e61090240b2.xml'
    # ]

    # for sitemap in sitemaps:
    #     ign.add_urls_from_sitemap(sitemap)

    ign.get_latest_articles('reviews/games')

    # arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    # skip = 0
    # take = 3
    # while skip < len(arr):
    #     print(arr[skip:skip + take])
    #     skip += take