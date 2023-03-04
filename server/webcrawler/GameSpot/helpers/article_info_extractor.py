from bs4 import BeautifulSoup
import requests


SUBTITLE_DIV_CLASS = 'news-deck type-subheader'
AUTHOR_DIV_CLASS = 'byline-author'
# ARTICLE_TITLE_CLASS = 'card-item__link'


def get_article_info(article, raw_html):
    # download webpage
    soup = BeautifulSoup(raw_html, 'lxml')

    article['subtitle'] = soup.find('p', class_=SUBTITLE_DIV_CLASS).text.strip()
    article['author'] = soup.find('span', class_=AUTHOR_DIV_CLASS).a.text.strip()

    return article

# 3	Endorfun Review		https://www.gamespot.com/reviews/endorfun-review/1900-2535824/		1	830908800	review	1996	5	1	1
test = {
    'title': 'Ace Combat Preview',
    'url': 'https://www.gamespot.com/articles/ace-combat-4-preview/1100-2681406/'
}

raw_html = requests.get(test['url']).text
print(get_article_info(test, raw_html))