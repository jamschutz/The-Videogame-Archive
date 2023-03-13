import json
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from datetime import datetime
import sqlite3
from .._shared.DbManager import DbManager
from .._shared.Config import Config


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
    year = request.args.get('year')
    month = request.args.get('month')
    day = request.args.get('day')
    website_id = int(request.args.get('websiteId')) if request.args.get('websiteId') != None else -1

    # fetch db data and return
    db_manager = DbManager()
    response = db_manager.get_articles_for_date(year=year, month=month, day=day, website_id=website_id)
    return jsonify(response)



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

    start_epoch = get_epoch(start_date)
    end_epoch = get_epoch(end_date)

    # fetch db data and return
    db_manager = DbManager()
    db_result = db_manager.get_article_count_between_dates(start=start_epoch, end=end_epoch)

    response = []
    for date in db_result:
        response.append({
            'count': date[0],
            'date': f'{date[2]}/{date[3]}/{date[1]}'
        })

    return jsonify(response)


@app.route('/Search', methods=['GET', 'OPTIONS'])
@cross_origin(origin='*')
def get_search_results():
    # parse params
    title_query = request.args.get('title')
    subtitle_query = request.args.get('subtitle')

    # wrap % around search terms, for sql query
    title_query = f'%{title_query.replace(" ", "%")}%'
    subtitle_query = f'%{subtitle_query.replace(" ", "%")}%'

    # fetch db data and return
    db_manager = DbManager()
    db_result = db_manager.get_search_results(title_query=title_query, subtitle_query=subtitle_query)

    response = []
    for article in db_result:
        # Article.Title, Article.Subtitle, Article.Url, Article.YearPublished, Article.MonthPublished, Article.DayPublished, Article.WebsiteId, Writer.Name AS Author
        response.append({
            'title': article[0],
            'subtitle': article[1],
            'url': article[2],
            'date': f'{article[4]}/{article[5]}/{article[3]}',
            'website_id': article[6],
            'author': article[7]
        })

    return jsonify(response)


app.run()