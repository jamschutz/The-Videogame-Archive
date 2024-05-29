import requests
from Core.Config import Config
from pathlib import Path
from url_normalize import url_normalize
from bs4 import BeautifulSoup
import re, subprocess

class Utils:
    def __init__(self):
        self.config = Config()


    def get_two_char_int_string(self, n):
        n = int(n)

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
        
    def date_to_num(self, date):
        date = date.strftime('%m/%d/%Y')
        year = int(date.split('/')[2])
        month = int(date.split('/')[0])
        day = int(date.split('/')[1])
        return year * 10000 + month * 100 + day
        

    def get_thumbnail_extension(self, thumbnail_url):
        # TODO!!!!!!!!!!!!!!!!!!! --- test this adds the right amount of '.'s with other sites...!
        # if there's no file extension, just slap a .jpg on it
        return thumbnail_url.split('.')[-1] if thumbnail_url[-4] == '.' else 'jpg'
        

    def get_thumbnail_filename(self, article):
        thumbnail_url = article.thumbnail_url
        article_url = article.url
        date_published = str(article.date)
        day = date_published[6:]

        file_extension = self.get_thumbnail_extension(thumbnail_url)
        return f"{self.config.url_to_filename(article_url, day, article.website_id)}_thumbnail.{file_extension}"


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


    # def save_pdf_as_jpg(self, pdf_file):
    #     subprocess.Popen('"%s" -jpg "%s" out' % (self.config.PDF_TO_PPM_PATH, pdf_file))


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


    def download_and_save_image(self, img_url, folderpath, filename):
        # download image
        img_data = requests.get(img_url).content

        # make sure folder path exists
        Path(folderpath).mkdir(parents=True, exist_ok=True)

        # and write to disk
        with open(f'{folderpath}/{filename}', 'wb') as f:
            f.write(img_data)


    def download_css_images(self, css, css_url, css_img_folderpath):
        css_host_url = css_url[:css_url.rfind('/')]
        img_urls = []

        # parse img urls from css file
        for url in re.finditer('background: url\(([^()]+)\)', css):
            # grab between start / end of regex
            img_url = css[url.start():url.end()]
            # take only the part in the parentheses, e.g.: "background: url(TAKE_THIS_PART)"
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


    def download_images(self, raw_html, base_url, target_save_dir):
        # find all referenced css links
        soup = BeautifulSoup(raw_html, 'lxml')

        # download each image file
        for img in soup.find_all('img'):
            img_url = img['src']

            # if empty src, just continue
            if img_url is not None and img_url == '':
                print(f'got empty image...printing below')
                print(img)
                continue

            # if not a full url, prepend with base url
            if img_url is not None and img_url[0] == '/':
                img_url = f"{base_url}{img['src']}"

            # parse filename from url
            filename = img_url.split('/')[-1].split('?')[0]

            # download
            print(f'downloading {img_url}')
            self.download_and_save_image(img_url, target_save_dir, filename)

            # and update image src
            img['src'] = f'{target_save_dir}/{filename}'

        return soup.prettify('utf-8')


    def trim_punctuation(self, text):
        if len(text) == 0:
            return ""

        allowed_chars = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        start = 0
        while start < len(text) and text[start] not in allowed_chars:
            start += 1

        if start == len(text):
            return ""

        end = len(text) - 1
        while end > 0 and text[end] not in allowed_chars:
            end -= 1

        return text[start:end + 1]

        
        


if __name__ == '__main__':
    utils = Utils()
    css = ''
    url = 'https://www.eurogamer.net/unicorn-overlord-review-endless-options-propel-this-strategy-rpg-to-epic-heights'
    # with open('server/_shared/test.css', 'r') as f:
    #     css = f.read().replace('\n', '')
    
    # utils.download_css_images(css, 'TIGSource')
    source = requests.get(url).text
    html = utils.download_images(source, 'https://www.eurogamer.net', 'F:/_sandbox/Eurogamer')

    with open("F:/_sandbox/Eurogamer/unicorn-overlord-review-endless-options-propel-this-strategy-rpg-to-epic-heights.html", "wb") as f_output:
        f_output.write(html)
    