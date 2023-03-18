import requests
from server._shared.Config import Config
from pathlib import Path
from url_normalize import url_normalize
from bs4 import BeautifulSoup
import re

class Archiver:    
    def __init__(self):
        self.config = Config()


    def inject_css(self, raw_html, base_url, website, year, month, day, url):
        # if wayback, trim off the wayback inserts
        if 'web.archive.org' in base_url:
            raw_html = self.get_html_without_wayback_headers(raw_html)

        soup = BeautifulSoup(raw_html, 'lxml')

        # # find all referenced css links
        # css_links = soup.find_all('link', rel="stylesheet")

        # # download each file, and store its contents in a list
        # counter = 1
        # for css_link in css_links:
        #     # download css
        #     href = f"{base_url}{css_link['href']}"
        #     css = requests.get(href).text

        #     # save to disk
        #     folderpath = self.get_folder_path(website, year, month, 'css')
        #     filename = self.get_filename(website, day, url, 'css', 'css', suffix=f'{counter}')
        #     self.save_css(css, folderpath, filename)

        #     # and update our css to use our internal files
        #     local_folderpath = self.get_local_folder_path(website, year, month, 'css')
        #     css_link['href'] = f'{local_folderpath}/{filename}'

        #     counter += 1

        # download and inject images in html
        soup = self.download_html_imgs(soup, base_url, website, year, month, day, url)

        return str(soup)


    def get_html_without_wayback_headers(self, raw_html):
        # find start and ends of wayback inserts
        wayback_start = raw_html.find('<head>') + len('<head>')
        wayback_end = raw_html.find('<!-- End Wayback Rewrite JS Include -->') + len('<!-- End Wayback Rewrite JS Include -->')

        # and get only the html around it
        result = raw_html[:wayback_start]
        result += raw_html[wayback_end:]

        return result


    def save_css(self, css, folderpath, filename):
        # make sure folder path exists
        Path(folderpath).mkdir(parents=True, exist_ok=True)

        # and write to disk
        with open(f'{folderpath}/{filename}', 'w', encoding='cp932', errors='ignore') as f:
            f.write(css)


    def download_html_imgs(self, soup, base_url, website, year, month, day, url):
        
        # build folder paths
        folderpath = self.get_folder_path(website, year, month, 'img')
        local_folderpath = self.get_local_folder_path(website, year, month, 'img')

        
        counter = 1
        # download background imgs
        background_imgs = soup.find_all(background=True)
        for background_img in background_imgs:
            background_img = background_img['background']
            print(f'downloading background img: {background_img} ({counter} of {len(background_imgs)})...')
            # build filename info
            file_extension = background_img.split('.')[-1]
            filename = self.get_filename(website, day, url, 'img', file_extension, suffix=f'background{counter}')
            
            # download img
            self.download_img(background_img, base_url, folderpath, filename)

            # and update html
            soup.find('body')['background'] = f'{local_folderpath}/{filename}'

            counter += 1

        # download all <img> src's
        imgs = soup.find_all('img')
        counter = 1
        for img in imgs:
            print(f'downloading img {counter} of {len(imgs)}...')
            # build filename info
            file_extension = img['src'].split('.')[-1]
            filename = self.get_filename(website, day, url, 'img', file_extension, suffix=f'img{str(counter)}')
            
            # download img
            try:
                self.download_img(img['src'], base_url, folderpath, filename)
            except:
                print(f'error downloading img file. skipping!')
                counter += 1
                continue

            # and update html
            soup.find('body')['background'] = f'{local_folderpath}/{filename}'

            counter += 1

        return soup
            

    def download_img(self, img_filename, base_url, folderpath, filename):
        # download image
        img_url = f"{base_url}{img_filename}"
        img_data = requests.get(img_url).content

        # make sure folder path exists
        Path(folderpath).mkdir(parents=True, exist_ok=True)

        # and write to disk
        with open(f'{folderpath}/{filename}', 'wb') as f:
            f.write(img_data)

    
    # helpers
    def get_folder_path(self, website, year, month, filetype):
        return f'{self.config.ARCHIVE_FOLDER}/{website}/_{filetype}/{year}/{month}'

    def get_filename(self, website, day, url, filetype, extension, suffix=''):
        return f"{self.config.url_to_filename(url, day, self.config.website_id_lookup[website])}_{filetype}_{suffix}.{extension}"

    def get_local_folder_path(self, website, year, month, filetype):
        return f'/{website}/_{filetype}/{year}/{month}'




if __name__ == '__main__':
    archiver = Archiver()
    print(archiver.get_local_folder_path('N64.com', '1996', '12', 'img'))