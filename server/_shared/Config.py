# suppress __pycache__ folders
PYTHONDONTWRITEBYTECODE = True

class Config:
    # api vars
    API_BASE_URL = 'http://127.0.0.1:5000'
    GET_ARTICLES_API = 'Articles'
    GET_URLS_TO_ARCHIVE_API = 'UrlsToArchive'

    # file vars
    DATABASE_FILE = '/_database/VideogamesDatabase.db'
    WAYBACK_DATABASE_FILE = '/_database/WaybackDatabase.db'
    ARCHIVE_FOLDER = '/_website_backups'
    WAYBACK_MACHINE_DUMP_FOLDER = '/_WaybackMachineDumps'
    

    # website lookups
    website_id_lookup = {
        'GameSpot': 1,
        'Eurogamer': 2,
        'Gameplanet': 3,
        'JayIsGames': 4,
        'TIGSource': 5,
        'Indygamer': 6,
        'N64.com': 99
    }
    website_name_lookup = {
        1: 'GameSpot',
        2: 'Eurogamer',
        3: 'Gameplanet',
        4: 'JayIsGames',
        5: 'TIGSource',
        6: 'Indygamer',
        99: 'N64.com'
    }



    def url_to_filename(self, url, day, website_id=1):
        filename = ''
        if website_id == 1:
            # convert https://example.com/something/TAKE_THIS_PART
            filename = f'{day}_{"_".join(url.split("/")[4:])}'
        else:
            # convert https://www.eurogamer.net/TAKE_THIS_PART
            filename = f'{day}_{"_".join(url.split("/")[3:])}'

        # if it has url parameters, remove them
        if '?' in filename:
            filename = filename[:filename.find('?')]

        # if ends in underscore, remove it
        if filename[-1] == '_':
            filename = filename[:-1]

        return filename


if __name__ == '__main__':
    config = Config()
    test_url = 'https://www.gamespot.com/review/destiny-the-taken-king/?slug=destiny-the-taken-king-review-in-progress&typeId=1100&id=6430557'
    test_day = '04'

    print(config.url_to_filename(test_url, test_day))