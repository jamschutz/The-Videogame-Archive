import ocrmypdf, os, shutil


# target_file = '/_magazineDumps/Edge/Edge_Gaming/Edge Gaming Magazine 001.pdf'
# output_file = 'OcrTest.pdf'

MAX_FILES_TO_CONVERT = 300


source_folder = '/_magazineDumps/Edge/Edge_Gaming'
target_folder = '/_magazineDumps/Edge/Edge_Gaming_OCR'


def apply_ocr(filename):
    ocrmypdf.ocr(f'{source_folder}/{filename}', f'{target_folder}/{filename}', language='eng', dir_index=False)


def convert_all_files_to_ocr(directory):
    # get all pdf files
    pdf_files = os.listdir(directory)
    pdf_files_converted = os.listdir(target_folder)

    # and save each one
    counter = 1
    for pdf_file in pdf_files:
        # and if we've hit our max, break
        if counter > MAX_FILES_TO_CONVERT:
            break

        # if we've already converted this file, skip...
        if pdf_file in pdf_files_converted:
            continue

        # apply ocr
        print(f'\n\n\nconverting {pdf_file} ({counter} of {MAX_FILES_TO_CONVERT})...')
        try:
            apply_ocr(pdf_file)
        except ocrmypdf.exceptions.PriorOcrFoundError:
            print(f'{pdf_file} already has OCR, just going to copy it over to the new directory')
            shutil.copy(f'{source_folder}/{pdf_file}', f'{target_folder}/{pdf_file}')

        # and increase our counter        
        counter += 1


convert_all_files_to_ocr(source_folder)