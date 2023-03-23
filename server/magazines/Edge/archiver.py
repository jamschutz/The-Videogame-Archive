import pathlib, shutil, json, pdf2image
from PyPDF2 import PdfReader, PdfWriter

from server._shared.Config import Config
from server._shared.Utils import Utils


MAGAZINE_NAME = 'Edge'


output_folder = '/The Videogame Archive/server/magazines/Edge'
source_folder = '/_magazineDumps/Edge/Edge_Gaming_OCR'
TARGET_FILE = 'Edge Gaming Magazine 001.pdf'

DATA_FOLDER = '/The Videogame Archive/server/magazines/Edge/data'

config = Config()
utils = Utils()


def save_page_subset(filename, issue_number, year, month, start_page, end_page, article_title):
    # make sure year and month are two chars
    year  = utils.get_two_char_int_string(year)
    month = utils.get_two_char_int_string(month)

    with open(filename, 'rb') as pdf_file:
        # open up full pdf file
        pdf_reader = PdfReader(pdf_file)
        
        pdf_writer = PdfWriter()
        page = start_page
        
        # add each page between [start, end]
        while page <= end_page:
            pdf_writer.add_page(pdf_reader.pages[page - 1])

            page += 1

        # set target folder and filename
        folder_path = f'{config.ARCHIVE_FOLDER}/{MAGAZINE_NAME}/{year}/{month}'
        filename = config.pdf_filename_to_archive_filename(MAGAZINE_NAME, issue_number, start_page, article_title)

        # make sure folder path exists
        pathlib.Path(folder_path).mkdir(parents=True, exist_ok=True)

        # and save
        with open(f'{folder_path}/{filename}.pdf', 'wb') as output:
            pdf_writer.write(output)


def save_issue_thumbnail(full_issue_pdf_filename, year, month):
    # build folderpath / filename
    folderpath = f'{config.ARCHIVE_FOLDER}/{MAGAZINE_NAME}/_thumbnails/{year}/{month}'
    filename = f'{full_issue_pdf_filename.split("/")[-1]}_thumbnail'

    # grab first page of pdf
    pdf_pages = pdf2image.convert_from_path(f'{full_issue_pdf_filename}.pdf', single_file=True)

    # make sure folder path exists
    pathlib.Path(folderpath).mkdir(parents=True, exist_ok=True)

    # and save
    pdf_pages[0].save(f'{folderpath}/{filename}.jpg', 'JPEG')




def save_issue_and_articles(issue_number):
    # read article info from json file
    articles = {}
    with open(f'{DATA_FOLDER}/{str(issue_number)}.json', encoding='utf-8') as json_file:
        articles = json.load(json_file)

    # parse month/year
    month = articles['month']
    year = articles['year']

    # copy over the full issue
    full_issue_src_filename = f'Edge Gaming Magazine {utils.get_three_char_int_string(issue_number)}'
    full_issue_dst_filepath = f'{config.ARCHIVE_FOLDER}/{MAGAZINE_NAME}/{year}/{month}'
    full_issue_dst_filename = config.pdf_filename_to_archive_filename(MAGAZINE_NAME, issue_number)

    print(f'copying over full issue {full_issue_src_filename}...')
    shutil.copy(f'{source_folder}/{full_issue_src_filename}.pdf', f'{full_issue_dst_filepath}/{full_issue_dst_filename}.pdf')
    
    # save thumbnail
    print('saving thumbnail...')
    save_issue_thumbnail(f'{full_issue_dst_filepath}/{full_issue_dst_filename}', year, month)

    # then, copy over each article
    for article in articles['articles']:
        print(f'saving article {article["title"]}...')
        save_page_subset(f'{source_folder}/{full_issue_src_filename}.pdf', issue_number, year, month, article['start_page'], article['end_page'], article['title'])





save_issue_and_articles(1)