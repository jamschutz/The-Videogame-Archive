import requests
import json
from datetime import date, timedelta


ARTICLES_BY_DATE_DIR = '/The Videogame Archive/websitev2/buildTools/articlesByDate'

START_YEAR = 1996
START_MONTH = 5

END_YEAR = 2023
END_MONTH = 10


def get_dates():

    start_date = date(1996, 5, 1) 
    end_date = date.today()

    delta = end_date - start_date   # returns timedelta

    dates = []
    for i in range(delta.days + 1):
        day = start_date + timedelta(days=i)
        dates.append(day)

    return dates



dates = get_dates()

year = START_YEAR
month = START_MONTH

while year <= END_YEAR:
    max_month = END_MONTH if year == END_YEAR else 12
    while month <= max_month:
        print(f'getting results for {month}/{year}...')
        start_date = year * 10000 + month * 100
        end_date   = start_date + 99
        url = f'http://localhost:7070/api/GetArticles?date={start_date}&endDate={end_date}'
        response = requests.get(url)
        if(response.ok):
            articles = json.loads(response.content)
            with open(f'{ARTICLES_BY_DATE_DIR}/{start_date}.json', 'w', encoding='utf-8') as f:
                json.dump(articles, f, ensure_ascii=False, indent=4)
        else:
            print(f'unable to get articles for date {month}/{year}....')

        month += 1

    month = 1
    year += 1

print('done')