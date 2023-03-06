# suppress __pycache__ folders
PYTHONDONTWRITEBYTECODE = True

class Config:
    # api vars
    API_BASE_URL = 'http://127.0.0.1:5000'
    GET_ARTICLES_API = 'Articles'
    GET_URLS_TO_ARCHIVE_API = 'UrlsToArchive'

    # file vars
    DATABASE_FILE = '/_database/VideogamesDatabase.db'
    ARCHIVE_FOLDER = '/_website_backups'
    

    # website lookups
    website_id_lookup = {
        'GameSpot': 1,
        'Eurogamer': 2,
        'Gameplanet': 3
    }
    website_name_lookup = {
        1: 'GameSpot',
        2: 'Eurogamer',
        3: 'Gameplanet'
    }



    def url_to_filename(self, url, day):
        # convert https://example.com/something/TAKE_THIS_PART
        filename = f'{day}_{"_".join(url.split("/")[4:])}'

        # if ends in underscore, remove it
        if filename[-1] == '_':
            filename = filename[:-1]

        return filename