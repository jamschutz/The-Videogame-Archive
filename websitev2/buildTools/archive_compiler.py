import os
from pathlib import Path

src_folder = '_bin'
dst_file = '_site/code/archive.js'
current_dir = os.getcwd()

files = [
    # entities
    "entities\\CalendarDate.js",
    "entities\\Article.js",

    # utils
    "utils\\Utils.js",
    "utils\\Config.js",
    "utils\\DataManager.js",
    "utils\\UrlParser.js",

    # responses / requests
    "responses\\GetArticleCountResponse.js",
    "requests\\SearchRequest.js",

    # components
    "components\\Calendar.js",
    "components\\SearchBar.js",

    # main
    "archive.js"
]

compiled_js = ''

for js_file in files:
    with open(f'{current_dir}\\{src_folder}\\{js_file}') as f: 
        js = f.read()
        compiled_js += f'\n\n\n{js}'


with open(dst_file, "w") as f:
    f.write(compiled_js)