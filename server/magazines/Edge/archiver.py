import pathlib, shutil
from PyPDF2 import PdfReader, PdfWriter

from server._shared.Config import Config
from server._shared.Utils import Utils


MAGAZINE_NAME = 'Edge'


output_folder = '/The Videogame Archive/server/magazines/Edge'
source_folder = '/_magazineDumps/Edge/Edge_Gaming_OCR'
TARGET_FILE = 'Edge Gaming Magazine 001.pdf'

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
            print(f'adding page {page}...')
            pdf_writer.add_page(pdf_reader.pages[page - 1])

            page += 1

        # set target folder and filename
        folder_path = f'{config.ARCHIVE_FOLDER}/{MAGAZINE_NAME}/{year}/{month}'
        filename = config.pdf_filename_to_archive_filename(MAGAZINE_NAME, issue_number, article_title)

        # make sure folder path exists
        pathlib.Path(folder_path).mkdir(parents=True, exist_ok=True)

        # and save
        with open(f'{folder_path}/{filename}.pdf', 'wb') as output:
            pdf_writer.write(output)


text = save_page_subset(f'{source_folder}/{TARGET_FILE}', 1, 1993, 10, 6, 7, 'Things to come')