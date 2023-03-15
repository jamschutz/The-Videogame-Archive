from enum import Enum
from url_normalize import url_normalize
import requests, pathlib, json, os

from .WaybackDbManager import WaybackDbManager
from .._shared.Config import Config
from .._shared.Utils import Utils

FILENAME = '/_WaybackMachineDumps/GameSpot/urls/_test.txt'
OUTPUT_FILENAME = '/_WaybackMachineDumps/GameSpot/urls/_OUTPUT.json'


def ignore_url(url):
    endings_to_ignore = [
        '/answers',
        '/forum',
        '/xbox360',
        '/videos',
        '/iphone',
        '/images',
        '/news',
        '/reviews',
        '/user-reviews',
        '/androi',
        '/android',
        '/platform/*',
        '/updates',
        '/update',
        '/images.html',
        '/forum.html',
        '/media.html',
        '/news.html',
        '/index.html',
        '/videos.html',
        '/forum.htm',
        '/images.htm',
        '/media.htm',
        '/news.htm',
        '/index.htm',
        '/videos.htm',
        '/answers.html',
        '/similar.html',
        '/tech_info.html',
        '/answers.htm',
        '/similar.htm',
        '/tech_info.htm',
        '/screenindex.html',
        '/screenindex.htm',
        '/players.html',
        '/players.htm',
        '/show_msgs.php'
    ]

    for ending in endings_to_ignore:
        if url.endswith(ending):
            return True

    return False


def scrub_url(url, urls_to_scrub):
    for u in urls_to_scrub:
        if u in url:
            return True
    
    return False


def clean_up_urls():
    urls = []
    urls_to_scrub = []

    # read file into urls
    with open(FILENAME) as f:
        for line in f:
            url = {
                'id': line.split('\t')[0],
                'url': line.split('\t')[-1].strip()
            }

            if '/images/' in url['url']:
                # just ignore
                continue
            elif ignore_url(url['url']):
                # if it has the pattern: https://www.gamespot.com/*/reviews
                if url['url'].count('/') == 4:
                    # we want to delete anything with: https://www.gamespot.com/MATCH_ABOVE/*
                    base_url = url['url'][:url['url'].rfind('/')]
                    if base_url not in urls_to_scrub:
                        urls_to_scrub.append(base_url)
            else:
                urls.append(url)


    # remove urls we said to scrub
    final_urls = []
    for url in urls:
        if not scrub_url(url['url'], urls_to_scrub):
            final_urls.append(url)


    print(f'got {len(final_urls)} results')



    # output reuslt
    with open(OUTPUT_FILENAME, "w") as f:
        f.write(json.dumps(final_urls, indent=4, sort_keys=True))

    



clean_up_urls()