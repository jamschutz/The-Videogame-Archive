import json
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
import sqlite3
from .._shared.DbManager import DbManager
from .._shared.Config import Config


config = Config()

app = Flask(__name__)
CORS(app, support_credentials=True)


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
    year = request.args.get('year')
    month = request.args.get('month')
    day = request.args.get('day')

    # fetch db data and return
    db_manager = DbManager()
    response = db_manager.get_article_count_for_date(year=year, month=month, day=day)
    return jsonify(response)


app.run()