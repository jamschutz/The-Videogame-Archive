import requests
from server._shared.Config import Config
from pathlib import Path
from url_normalize import url_normalize
from bs4 import BeautifulSoup
import re

class Utils:
    def __init__(self):
        self.config = Config()


    def get_two_char_int_string(self, n):
        if(n < 10):
            return f'0{str(n)}'
        else:
            return str(n)

    def get_three_char_int_string(self, n):
        if(n < 10):
            return f'00{str(n)}'
        elif(n < 100):
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
            raw_css = requests.get(href).text
            css += raw_css + "\n"
            # self.download_css_images(raw_css, href, website)

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
        if url.find('#') >= 0:
            url = url[:url.rfind('#')]
        
        # and remove url parameters
        if url.find('?') >= 0:
            url = url[:url.rfind('?')]

        return url


    def download_css_images(self, css, css_url, css_img_folderpath):
        css_host_url = css_url[:css_url.rfind('/')]
        img_urls = []

        # parse img urls from css file
        for url in re.finditer('background: url\(([^()]+)\)', css):
            # grab between start / end of regex
            img_url = css[url.start():url.end()]
            # lop of take on the part in the parentheses, e.g.: "background: url(TAKE_THIS_PART)"
            img_url = img_url[len('background: url('):-1]
            
            # and store, adding the css url at the start
            img_urls.append(f'{css_host_url}/{img_url}')

        # now, download each img, and save
        folderpath = f''
        for url in img_urls:
            # download image
            img_data = requests.get(url).content

            # make sure folder path exists
            Path(folderpath).mkdir(parents=True, exist_ok=True)

            # and write to disk
            with open(f'{folderpath}/{filename}', 'wb') as f:
                f.write(img_data)


        print(background_url_declarations)
        


if __name__ == '__main__':
    utils = Utils()
    css = ''
    # with open('server/_shared/test.css', 'r') as f:
    #     css = f.read().replace('\n', '')
    
    # utils.download_css_images(css, 'TIGSource')

    url = 'http://www.n64.com:80/web/n64_ext_stan_news_archive#go/to/the/end'
    print(utils.normalize_url(url))