import requests
from server._shared.Config import Config
from pathlib import Path
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


if __name__ == '__main__':
    img_url = 'https://www.gamespot.com/a/uploads/screen_petite/1440/14409144/2230806-default-art--screen.jpg'
    filename = ''
    
    config = Config()
    filepath = f'{config.ARCHIVE_FOLDER}/GameSpot/_thumbnails/2000/02'
    filename = f'17_john-romero-loses-daikatana_1100-2440247_thumbnail.jpg'

    utils = Utils()
    utils.save_thumbnail(img_url, filename, filepath)