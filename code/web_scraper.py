from bs4 import BeautifulSoup
import requests

source = requests.get('https://www.gamespot.com/news/?page=4425').text
soup = BeautifulSoup(source, 'lxml')

articles = soup.find_all('a', class_='card-item__link')

print(len(articles))

for article in articles:
    print(article.h4.text)