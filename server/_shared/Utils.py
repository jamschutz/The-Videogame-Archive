import requests
from server._shared.Config import Config
from pathlib import Path
from url_normalize import url_normalize
from bs4 import BeautifulSoup

class Utils:
    def __init__(self):
        self.config = Config()


    def get_two_char_int_string(self, n):
        if(n < 10):
            return f'0{str(n)}'
        else:
            return str(n)


    def save_thumbnail(self, img_url, filename, folderpath):
        # download image
        img_data = requests.get(img_url).content

        # clean up folder path
        if folderpath[-1] == '/':
            folderpath = folderpath[:-1]

        # make sure folder path exists
        Path(folderpath).mkdir(parents=True, exist_ok=True)

        # and write to disk
        with open(f'{folderpath}/{filename}', 'wb') as f:
            f.write(img_data)


    def inject_css(self, raw_html, base_url):
        soup = BeautifulSoup(raw_html, 'lxml')

        # find all referenced css links
        css_links = soup.find_all('link', rel="stylesheet")

        # download each file, and store its contents in a list
        css = ''
        for css_link in css_links:
            href = f"{base_url}{css_link['href']}"
            css += requests.get(href).text + "\n"

            # remove this css element from the html
            css_link.decompose()

        # find head element
        head = soup.find('head')

        # create css style element
        css_style = soup.new_tag("style")
        css_style.string = css

        # and add to the head
        head.append(css_style)

        return str(soup)


    def normalize_url(self, url):
        url = url.replace('..', '.')
        # run through basic normalization
        url = url_normalize(url)

        # just slap https onto everything
        url = f"https://{url.split('://')[1]}"

        # if it doesn't start with www, add it in
        www_start = len('https://')
        www_end = www_start + len('www')
        if url[www_start:www_end] != 'www':
            url = f"https://www.{url.split('://')[1]}"

        # remove #some_tag at the end of urls
        end_directory = url.split('/')[-1]
        if len(end_directory) > 0 and end_directory.find('#') >= 0:
            url = url[:url.rfind('#') + 1]
        
        # and remove url parameters
        url = url[:url.rfind('?')]

        return url
        


if __name__ == '__main__':
    url = 'https://www.gamespot.com/#message_inbo'
    utils = Utils()
    print(utils.normalize_url(url))