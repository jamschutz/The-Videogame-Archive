from pypdf import PdfReader


source_folder = '/_magazineDumps/Edge/Edge_Gaming_OCR'
TARGET_FILE = 'Edge Gaming Magazine 001.pdf'


def get_pdf_text(filename):
    reader = PdfReader(filename)
    pages = ''
    page_number = 1
    for page in reader.pages:
        pages += f'------- PAGE {str(page_number)} ---------\n\n' + page.extract_text() + '\n\n\n\n'
        page_number += 1

    return pages


text = get_pdf_text(f'{source_folder}/{TARGET_FILE}')
with open("test.txt", "w", errors="ignore") as text_file:
    text_file.write(text)