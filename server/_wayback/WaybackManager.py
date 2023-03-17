from enum import Enum
from url_normalize import url_normalize
import requests, pathlib, json, os

from .WaybackDbManager import WaybackDbManager
from .._shared.Config import Config
from .._shared.Utils import Utils


    
class WaybackFilter(Enum):
    UrlKey = 'urlkey'
    Timestamp = 'timestamp'
    Original = 'original'
    Mimetype = 'mimetype'
    StatusCode = 'statuscode'
    Digest = 'digest'
    Length = 'length'


class WaybackManager:
    DEFAULT_FILTERS = [
        WaybackFilter.UrlKey,
        WaybackFilter.Timestamp,
        WaybackFilter.Original,
        WaybackFilter.Mimetype,
        WaybackFilter.StatusCode
    ]

    def __init__(self):
        self.config = Config()
        self.db = WaybackDbManager()
        self.utils = Utils()


    def save_list_of_urls(self, url, website, filters=DEFAULT_FILTERS):
        # build wayback url
        wayback_api_url = f'http://web.archive.org/cdx/search/cdx?url={url}&matchType=prefix'
        num_pages_url = f'{wayback_api_url}&showNumPages=true'
        folder_path = f'{self.config.WAYBACK_MACHINE_DUMP_FOLDER}/{website}'

        # get num pages
        num_pages = int(requests.get(num_pages_url).text.strip())

        # and for each page, save to dump folder
        for page in range(num_pages):  # stopped at page 356
            print(f'getting page {page + 1} of {num_pages}...')
            # get page result
            results = requests.get(f'{wayback_api_url}&page={str(page)}').text

            # convert text to dictionary
            data = []
            for result in results.split('\n'):
                try:
                    url_info = result.split(' ')
                    data.append({
                        'url_data': url_info[0],
                        'timestamp': url_info[1],
                        'url': url_info[2],
                        'mimetype': url_info[3],
                        'statuscode': url_info[4],
                        'digest': url_info[5],
                        'length': url_info[6]
                    })
                except:
                    if result != '':
                        print(f'error with result: {result}')


            # make sure folder path exists
            pathlib.Path(folder_path).mkdir(parents=True, exist_ok=True)

            # and save
            with open(f'{folder_path}/{page}.json', 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=4)

        print('done')


    def consolidate_url_lists(self, website):
        folderpath = f'{self.config.WAYBACK_MACHINE_DUMP_FOLDER}/{website}'
        urls = {}
        files_already_done = [
            0, 1, 2
        ]
        # for filename in os.listdir(folderpath):
        for i in range(1234):
            if i in files_already_done or i < 1002: 
                continue
            filename = f'{i}.json'
            print(f'looking in file {filename}...')
            with open(f'{folderpath}/{filename}','r', encoding='cp932', errors='ignore') as f:
                data = json.load(f)

                # normalize data
                for item in data:
                    item['raw_url'] = item['url'].replace("'", "''")
                    item['url'] = self.utils.normalize_url(item['url']).replace("'", "''")
                    item['url_data'] = item['url_data'].replace("'", "''")
                    item['statuscode'] = None if item['statuscode'] == '-' else item['statuscode']
                    item['length'] = 0 if item['length'] == '-' else item['length']
                
                # and send to db
                self.db.add_wayback_snapshots(data, website, filename)


    def get_oldest_snapshopt_url(self, url, filters=DEFAULT_FILTERS):
        result = requests.get(f'http://web.archive.org/cdx/search/cdx?url={url}&matchType=prefix').text
        return result


if __name__ == '__main__':
    # test_url = 'www.ign.com'
    # wayback = WaybackManager()
    # wayback.save_list_of_urls('www.n64.com', 'N64.com')

    wayback.consolidate_url_lists('IGN')

    # results = wayback.get_oldest_snapshopt_url(test_url)
    # # and save
    # with open(f'wayback.txt', "w", encoding="utf-8") as html_file:
    #     html_file.write(results)