import json
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
import sqlite3
from .._shared.DbManager import DbManager


DATABASE_FILE = '/_database/VideogamesDatabase.db'


app = Flask(__name__)
CORS(app, support_credentials=True)


@app.route('/Articles', methods=['GET', 'OPTIONS'])
@cross_origin(origin='*')
def get_articles_for_date():
    year = request.args.get('year')
    month = request.args.get('month')
    day = request.args.get('day')
    website_id = int(request.args.get('websiteId')) if request.args.get('websiteId') != None else -1

    print(f'year: {year}')

    db_manager = DbManager()
    response = db_manager.get_articles_for_date(year=year, month=month, day=day, website_id=website_id)
    return jsonify(response)



@app.route('/UrlsToBeArchived', methods=['GET', 'OPTIONS'])
@cross_origin(origin='*')
def get_archived_websites():
    limit = request.args.get('limit') if request.args.get('websiteId') != None else 50
    website_id = int(request.args.get('websiteId')) if request.args.get('websiteId') != None else -1

    db_manager = DbManager()
    response = db_manager.get_archived_websites(limit, website_id)
    return jsonify(response)


app.run()