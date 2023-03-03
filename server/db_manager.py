#!/usr/bin/env python
# encoding: utf-8
import json
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
import sqlite3

DATABASE_FILE = '/_database/VideogamesDatabase.db'


app = Flask(__name__)
CORS(app, support_credentials=True)

def get_db_query(year, month, day, website_id):
    query = f"SELECT Title, MonthPublished, DayPublished, Url, WebsiteId FROM Article WHERE YearPublished = {year}"
    if month != None:
        query += f' AND MonthPublished = {month}'
    if day != None:
        query += f' AND DayPublished = {day}'
    if website_id >= 0:
        query += f"AND WebsiteId = {website_id}"

    return query


@app.route('/Articles', methods=['GET', 'OPTIONS'])
@cross_origin(origin='*')
def get_articles_for_date():
    year = request.args.get('year')
    month = request.args.get('month')
    day = request.args.get('day')
    website_id = int(request.args.get('websiteId')) if request.args.get('websiteId') != None else -1

    # connect to db, and save
    db = sqlite3.connect(DATABASE_FILE)
    cursor = db.cursor()

    # execute script, save, and close
    query = get_db_query(year, month, day, website_id)    
    result = cursor.execute(query)
    articles = result.fetchall()
    db.close()

    articles_formatted = []
    for article in articles:
        articles_formatted.append({
            'title': article[0],
            'month': article[1],
            'day': article[2],
            'url': article[3],
            'website': article[4]
        })

    response = jsonify(articles_formatted)
    return response



@app.route('/ArchivedWebsites', methods=['GET', 'OPTIONS'])
@cross_origin(origin='*')
def get_archived_websites():
    limit = request.args.get('limit') if request.args.get('websiteId') != None else 50
    website_id = int(request.args.get('websiteId')) if request.args.get('websiteId') != None else -1

    # connect to db, and save
    db = sqlite3.connect(DATABASE_FILE)
    cursor = db.cursor()

    # execute script, save, and close
    query = f"""
SELECT
	Title, Url, YearPublished, MonthPublished, DayPublished, WebsiteId
FROM
	Article
WHERE
	IsArchived = 0 
    """
    if website_id > 0:
        query += f' AND WebsiteId = {website_id}'

    query += f"""
LIMIT {limit}
    """


    result = cursor.execute(query)
    articles = result.fetchall()
    db.close()

    articles_formatted = []
    for article in articles:
        articles_formatted.append({
            'title': article[0],
            'url': article[1],
            'year': article[2],
            'month': article[3],
            'day': article[4],
            'website': article[5]
        })

    response = jsonify(articles_formatted)
    return response




app.run()