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

    # azure storage account vars
    AZ_ARCHIVE_FOLDER = '$web/archive'

    # db vars
    PLACEHOLDER_AUTHOR_ID = 1210
    PLACEHOLDER_AUTHOR_NAME = '[TODO: Add Writer...!]'

    # libary vars
    PDF_TO_PPM_PATH = '/The Videogame Archive/thirdparty/poppler-0.68.9/bin/pdftoppm.exe'
    

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

    def get_three_char_int_string(self, n):
        if(n < 10):
            return f'00{str(n)}'
        elif(n < 100):
            return f'0{str(n)}'
        else:
            return str(n)


    def pdf_filename_to_archive_filename(self, magazine_name, issue_number, article_start_page=None, article_title=None):
        # make sure issue number is 3 characters
        issue_number = self.get_three_char_int_string(issue_number)
        
        # if it's not an article, it's the full issue
        if article_title == None:
            return f'{magazine_name}_{issue_number}_FullIssue'

        # otherwise, return the article name in the title
        # normalize title -- replace spaces with underscores, and remove special chars
        normalized_title = ''.join(c for c in article_title.replace(' ', '_') if c.isalnum() or c == '_')
        article_start_page = self.get_three_char_int_string(article_start_page)
        return f'{magazine_name}_{issue_number}_p{article_start_page}_{normalized_title}'



if __name__ == '__main__':
    config = Config()
    test_url = 'https://www.gamespot.com/review/destiny-the-taken-king/?slug=destiny-the-taken-king-review-in-progress&typeId=1100&id=6430557'
    test_day = '04'

    print(config.url_to_filename(test_url, test_day))


    # print(config.pdf_filename_to_archive_filename('Edge', 1, 'Things to come'))
    # print(config.pdf_filename_to_archive_filename('Edge', 1))