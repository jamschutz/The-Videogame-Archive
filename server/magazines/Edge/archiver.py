# from pypdf import PdfReader
from PyPDF2 import PdfReader, PdfWriter


output_folder = '/The Videogame Archive/server/magazines/Edge'
source_folder = '/_magazineDumps/Edge/Edge_Gaming_OCR'
TARGET_FILE = 'Edge Gaming Magazine 001.pdf'


def save_page_subset(filename, output_filename, start_page, end_page):
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
        folder_path = f'{config.ARCHIVE_FOLDER}/{WEBSITE_NAME}/{year}/{month}'
        filename = config.url_to_filename(url, day, WEBSITE_ID)

        # make sure folder path exists
        pathlib.Path(folder_path).mkdir(parents=True, exist_ok=True)

        # and save
        with open(f'{folder_path}/{filename}.html', 'wb') as output:
            pdf_writer.write(output)
        # with open(output_filename, 'wb') as output:
        #     pdf_writer.write(output)


text = save_page_subset(f'{source_folder}/{TARGET_FILE}', f'{output_folder}/test.pdf', 6, 7)
# with open("test.txt", "w", errors="ignore") as text_file:
#     text_file.write(text)