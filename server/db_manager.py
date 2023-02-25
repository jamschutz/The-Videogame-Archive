#!/usr/bin/env python
# encoding: utf-8
import json
from flask import Flask, jsonify, request
import sqlite3

DATABASE_FILE = 'D:/dev/Code/VideogameArchive/_database/VideogamesDatabase.db'


app = Flask(__name__)

@app.route('/', methods=['GET'])
def get_articles_for_date():
    year = request.args.get('year')
    month = request.args.get('month')
    day = request.args.get('day')
    websiteId = int(request.args.get('websiteId')) if request.args.get('websiteId') != None else -1

    # connect to db, and save
    db = sqlite3.connect(DATABASE_FILE)
    cursor = db.cursor()

    # execute script, save, and close
    query = f"SELECT Title, MonthPublished, DayPublished, Url, WebsiteId FROM Article WHERE YearPublished = {year} AND MonthPublished = {month} AND DayPublished = {day}"
    if websiteId >= 0:
        query += f"AND WebsiteId = {websiteId}"
    
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
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

app.run()