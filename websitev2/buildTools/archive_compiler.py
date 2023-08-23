import os

src_folder = '_bin'
dst_file = '_site/code/archive.js'
current_dir = os.getcwd()

files = [
    # entities
    "entities\\CalendarDate.js",
    # "entities\\Article.js",

    # utils
    "utils\\Utils.js",
    # "shared\\Config.js",
    # "shared\\DataManager.js",
    "utils\\UrlParser.js",

    # responses / requests
    # "responses\\GetArticleCountResponse.js",
    # "responses\\SearchResponse.js",
    "requests\\SearchRequest.js",

    # components
    # "ui\\WebsiteColumn.js",
    # "ui\\Calendar.js",
    # "ui\\DateHeader.js",
    # "ui\\SearchBar.js",

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