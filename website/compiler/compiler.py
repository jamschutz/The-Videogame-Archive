src_folder = 'code/js'
dst_file = 'compiler/tmp/compiled.js'

files = [
    # entities
    "entities/CalendarDate.js",
    "entities/Article.js",

    # shared
    "shared/Utils.js",
    "shared/Config.js",
    "shared/DataManager.js",
    "shared/UrlParser.js",

    # responses / requests
    "responses/GetArticleCountResponse.js",
    "responses/SearchResponse.js",
    "requests/SearchRequest.js",

    # components
    "ui/WebsiteColumn.js",
    "ui/Calendar.js",
    "ui/DateHeader.js",
    "ui/SearchBar.js",

    # main
    "archive.js"
]

compiled_js = ''

for js_file in files:
    with open(f'{src_folder}/{js_file}') as f: 
        js = f.read()
        compiled_js += f'\n\n\n{js}'

with open(dst_file, "w") as f:
    f.write(compiled_js)