from bs4 import BeautifulSoup
from multiprocessing.dummy import Pool as ThreadPool
import requests, time
from Core.DB.ArticlesManager import ArticlesManager
from Core.DB.WebsitesManager import WebsitesManager
from Core.Utils import Utils
from Core.AzureStorageManager import AzureStorageManager
from Core.Archiver import Archiver
from Core.SearchIndexer import SearchIndexer
from Entities.Article import Article


class ArchiverIGN:

    def __init__(self):
        # basic helpers
        self.website_name = 'IGN'
        self.az_storage_manager = AzureStorageManager()
        self.archiver = Archiver()
        self.search_indexer = SearchIndexer()
        self.articles_manager = ArticlesManager()
        self.utils = Utils()
        self.website_id = WebsitesManager().get_id(self.website_name)
        self.BATCH_SIZE = 500

        # article div info
        self.SUBTITLE_DIV_CLASS = 'title3'
        self.AUTHOR_DIV_CLASS = 'article-author'
    

    def get_article_type(self, soup):
        article_section = soup.find('section', class_='article-section')

        if 'review' in article_section['class']:
            return 'review'
        else:
            return 'news'



    def get_article_data(self, article, raw_html):
        # parse html
        soup = BeautifulSoup(raw_html, 'lxml')

        try:
            # add info we need
            article.title = soup.find('div', class_='page-header').find('h1', class_='display-title').text.strip()
            # not all articles have subtitles...
            article.subtitle = soup.find('div', class_='page-header').find('h2', class_=self.SUBTITLE_DIV_CLASS)
            if article.subtitle == None:
                article.subtitle = ''
            else:
                article.subtitle = article.subtitle.text.strip()

            article.author = soup.find('span', class_=self.AUTHOR_DIV_CLASS)
            if article.author is None:
                article.author = soup.find('a', class_=self.AUTHOR_DIV_CLASS)

            # a few articles where there's no author...just list as "IGN" and move on
            if article.author is None:
                article.author = 'IGN'
            else:
                article.author = article.author.text.strip()
            article.type = self.get_article_type(soup)
            # NOTE: not getting thumbnail url because we stored that in the url indexing phase

            return article

        except Exception as e:
            print(f'ERROR parsing: {article.title}: {str(e)}')
            return None
        

    def get_article_content(self, raw_html):
        soup = BeautifulSoup(raw_html, 'lxml')
        paragraphs = soup.find('div', class_="content-entity-body").find_all('p')

        content = ""
        for paragraph in paragraphs:
            content += f' {paragraph.text}'
        
        return content
    

    def is_games_articles(self, raw_html):
        soup = BeautifulSoup(raw_html, 'lxml')
        article_tags = soup.find_all('a', class_='article-object-link')

        # if there's no tag, let's just assume it's a games article
        if article_tags is None or len(article_tags) == 0:
            return True
        
        # look for at least one games tag...
        for tag in article_tags:
            if tag['href'].startswith('/games/'):
                return True
            
        # if we didn't find any, not a games article
        return False
        
    
    def delete_non_games_articles(self, articles):
        if len(articles) == 0:
            return

        print('---------------deleting the following articles...')
        for article in articles:
            print(article.url)
        self.articles_manager.delete_articles(articles)
        print('---------------done deleting')
    

    def archive_article(self, article):
        print(f'saving article {article.url} ({article.date})....')
            
        # download webpage
        headers = {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36'
        }
        web_response = requests.get(article.url, headers=headers)

        # wait for throttle to end...
        retry_count = 0
        while not web_response.ok:
            if retry_count > 5:
                # hmm need to look into it further...
                return {
                    'article': None,
                    'delete': False
                }
            
            retry_count += 1
            print(f'waiting for throttle to end...')
            print(web_response.content)
            print(web_response.headers)
            time.sleep(5)
            web_response = requests.get(article.url, headers=headers)

            # if webpage is 404, just bail
            soup = BeautifulSoup(web_response.text, 'lxml')
            if soup.title.string == 'IGN Error 404 - Not Found':
                return {
                    'article': article,
                    'delete': True
                }

        raw_html = web_response.text

        # if this is not even a games article, flag for deletion
        if not self.is_games_articles(raw_html):
            return {
                'article': article,
                'delete': True
            }

        # get article data
        article = self.get_article_data(article, raw_html)
        # content = self.get_article_content(raw_html)
        
        # if None, something went wrong, just skip
        if article != None:
            # save to filepath
            self.archiver.send_article_to_archive(article, raw_html, self.website_name, send_thumbnail=False)
            # self.archiver.send_thumbnail_to_archive(article, self.website_name)
            # self.search_indexer.index_article(content, article.id)

            # and update its info in the DB
            self.articles_manager.update_article(article)

        return {
            'article': article,
            'delete': False
        }



    def archive_queued_urls(self, num_urls_to_archive):
        # get articles to archive
        articles_to_archive = self.articles_manager.get_articles_to_archive(num_urls_to_archive, self.website_id)

        # and archive each one
        non_games_articles = []

        pool = ThreadPool(8)
        results = pool.map(self.archive_article, articles_to_archive)
        pool.close()
        pool.join()

        # get list of articles that were succesfully archived
        articles_archived_successfully = [a['article'] for a in results if a['delete'] is False and a['article'] is not None]
        non_games_articles = [a['article'] for a in results if a['delete'] is True]
        
        # mark as archived in the db
        if len(articles_archived_successfully) > 0:
            self.articles_manager.mark_articles_as_archived(articles_archived_successfully)

        # and delete non-games articles...
        self.delete_non_games_articles(non_games_articles)



    def archive_all_urls(self):
        counter = 0
        batch_size = 10
        total_articles_to_archive = self.articles_manager.get_num_articles_to_archive(self.website_id)
        start = time.time()

        while counter < total_articles_to_archive:
            stats = self.utils.get_articles_per_second_and_time_remaining(start, counter, total_articles_to_archive)
            print(f'------------archiving... [{counter} / {total_articles_to_archive}] | {stats["avg"]}/s  ({stats["remaining"]} remaining)')
            self.archive_queued_urls(batch_size)
            counter += batch_size

            # don't flood their server with requests..
            time.sleep(1)

        print('done')
    
if __name__ == '__main__':
    archiver = ArchiverIGN()
    archiver.archive_all_urls()

    # article = Article(
    #     title="Krash Gets Krunched",
    #     date=19971112,
    #     url="https://www.ign.com/articles/1997/11/12/krash-gets-krunched",
    #     id=685635
    # )
    # archiver.archive_article(article)


    # start = time.time()
    # archiver.archive_queued_urls(50, 0, 50)
    # end = time.time()
    # print(f'fetching articles took: {end - start} seconds')

    # urls = [
    #     'https://www.ign.com/articles/1996/10/01/the-history-of-mario',
    #     'https://www.ign.com/articles/1996/09/24/lincoln-recaps-n64-price-drop',
    #     'https://www.ign.com/articles/the-lord-of-the-rings-the-rings-of-power-season-2-debuts-a-new-character-that-could-have-major-canon-implications',
    #     'https://www.ign.com/articles/wuthering-waves-review'
    # ]
    # headers = {
    #     'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36'
    # }

    # for url in urls:
    #     html = requests.get(url, headers=headers).text
    #     print(archiver.get_article_type(html))
    # # download webpage
    # print('getting html...')
    # headers = {
    #     'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36'
    # }
    # raw_html = requests.get('https://www.ign.com/articles/disney-dreamlight-valley-review', headers=headers).text

    # # get article data
    # print('parsing data...')
    # article = archiver.get_article_data(Article(url='https://www.ign.com/articles/disney-dreamlight-valley-review'), raw_html)
    # print(article.to_string())