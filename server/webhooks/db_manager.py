import json
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from datetime import datetime
from bitarray import bitarray
from bitarray.util import ba2int
import sqlite3
from .._shared.DbManager import DbManager
from .._shared.Config import Config
from .._shared.AzureDbManager import AzureDbManager


config = Config()

app = Flask(__name__)
CORS(app, support_credentials=True)


def get_epoch(date):
    year = date[:4]
    month = date[4:6]
    day = date[6:]

    return (datetime(int(year), int(month), int(day)) - datetime(1970, 1, 1)).total_seconds()


@app.route('/Articles', methods=['GET', 'OPTIONS'])
@cross_origin(origin='*')
def get_articles_for_date():
    # parse params
    date = request.args.get('date')
    website_id = int(request.args.get('websiteId')) if request.args.get('websiteId') != None else -1

    # fetch db data and return
    db_manager = AzureDbManager()
    db_response = db_manager.get_articles_for_date(date=date, website_id=website_id)

    response = []
    for article in db_response:
        response.append({
            'title': article[0],
            'subtitle': article[1],
            'url': article[2],
            'author': article[3],
            'website': article[4],
            'type': article[5],
            'thumbnail': article[6]
        })
    return response



@app.route('/UrlsToArchive', methods=['GET', 'OPTIONS'])
@cross_origin(origin='*')
def get_urls_to_archive():
    # parse params
    limit = request.args.get('limit') if request.args.get('websiteId') != None else 50
    website_id = int(request.args.get('websiteId')) if request.args.get('websiteId') != None else -1

    # fetch db data and return
    db_manager = DbManager()
    response = db_manager.get_urls_to_archive(limit, website_id)
    return jsonify(response)


@app.route('/ArticleCount', methods=['GET', 'OPTIONS'])
@cross_origin(origin='*')
def get_article_count_for_date():
    # parse params
    start_date = request.args.get('start')
    end_date = request.args.get('end')

    # fetch db data and return
    db_manager = AzureDbManager()
    db_result = db_manager.get_article_count_between_dates(start=start_date, end=end_date)

    response = []
    for date in db_result:
        response.append({
            'count': date[0],
            'date': f'{date[1]}'
        })

    return jsonify(response)


@app.route('/ArticlesExist', methods=['GET', 'OPTIONS'])
@cross_origin(origin='*')
def get_article_exists_for_date():
    # parse params
    start_date = request.args.get('start')
    end_date = request.args.get('end')

    # fetch db data and return
    db_manager = AzureDbManager()
    db_result = db_manager.get_article_count_between_dates(start=start_date, end=end_date)

    # initialize info
    current_month_bits = bitarray()
    response = []
    debug_info = {}

    # get current date info
    current_month = int(int(start_date) / 100)
    next_expected_date = int(start_date)
    days_in_month = get_days_in_month(next_expected_date)

    for result in db_result:
        # parse response
        date = int(result[1])
        article_count = int(result[0])

        # if date is bigger than our expected next date
        # fill in NO ARTICLE entries for intervening dates
        if date > next_expected_date:
            print(f'date is bigger than expected! date: {date}, next: {next_expected_date}, daysinmonth: {days_in_month}')
            while next_expected_date != date and (next_expected_date - current_month * 100) <= days_in_month:
                print('adding 0...')
                current_month_bits.append(False)
                next_expected_date += 1

        # if we've moved into the next month...
        date_month = int(int(result[1]) / 100)
        if date_month > current_month:
            # store this month's bits into a new int
            # response.append(ba2int(current_month_bits))
            response.append(current_month_bits.to01())
            current_month_bits = bitarray()
            current_month = date_month

            # and update days in month
            days_in_month = get_days_in_month(date)
            # and set next expected date
            next_expected_date = (date_month * 100) + 1

            # if date is bigger than our expected next date
            # fill in NO ARTICLE entries for intervening dates
            if date > next_expected_date:
                print(f'date is bigger than expected! date: {date}, next: {next_expected_date}, daysinmonth: {days_in_month}')
                while next_expected_date != date and (next_expected_date - current_month * 100) <= days_in_month:
                    print('adding 0...')
                    current_month_bits.append(False)
                    next_expected_date += 1

        # add this date's bit to our bit string
        current_month_bits.append(article_count > 0)
        # and set next expected date
        next_expected_date = date + 1

    # response.append(ba2int(current_month_bits))
    response.append(current_month_bits.to01())
    return jsonify(response)


@app.route('/Search', methods=['GET', 'OPTIONS'])
@cross_origin(origin='*')
def get_search_results():
    # parse params
    search_term = request.args.get('term')
    search_term = search_term.replace(' ', '%')

    # fetch db data and return
    print(f'getting search results for {search_term}...')
    db_manager = AzureDbManager()
    db_response = db_manager.get_search_results(terms=search_term)
    print(f'got {len(db_response)} results')

    response = []
    for article in db_response:
        response.append({
            'title': article[0],
            'subtitle': article[1],
            'url': article[2],
            'date': article[3],
            'website': article[4],
            'author': article[5],
            'thumbnail': article[6],
            'type': article[7]
        })
    return response

    return jsonify(response)


@app.route('/DatesWithArticles', methods=['GET', 'OPTIONS'])
@cross_origin(origin='*')
def get_dates_with_articles():
    # parse params
    start_date = request.args.get('start')
    end_date = request.args.get('end')

    # fetch db data and return
    db_manager = AzureDbManager()
    db_result = db_manager.get_article_count_between_dates(start=start_date, end=end_date)

    # initialize info
    response = {}

    # get current date info
    current_month = int(int(start_date) / 100)

    for result in db_result:
        # parse response
        date = int(result[1])
        response[date] = True

    return jsonify(response)



def get_days_in_month(date_int):
    year = int(date_int / 10000)
    month = int((date_int - (year * 10000)) / 100)

    if month == 1: 
        return 31
    if month == 2: 
        return 29 if is_leap_year(year) else 28
    if month == 3: 
        return 31
    if month == 4: 
        return 30
    if month == 5: 
        return 31
    if month == 6: 
        return 30
    if month == 7: 
        return 31
    if month == 8: 
        return 31
    if month == 9: 
        return 30
    if month == 10: 
        return 31
    if month == 11: 
        return 30
    if month == 12: 
        return 31

    print('GOT BAD DATE_INT!!!!!!!!')
    return -1


def is_leap_year(year):
    if((year % 100) == 0):
        return (year % 400) == 0

    return (year % 4) == 0


app.run(host="localhost", port=7070, debug=True)