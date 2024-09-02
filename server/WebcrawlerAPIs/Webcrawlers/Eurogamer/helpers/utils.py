from Core.Utils import Utils


def get_two_char_month_string(month):
    if(month < 10):
        return f'0{str(month)}'
    else:
        return str(month)


# date in format YYYY/MM
def get_next_month(date):
    year  = date.split('/')[0]
    month = int(date.split('/')[1])

    month += 1
    if(month > 12):
        month = 1
        year = str(int(year) + 1)

    return f'{year}/{get_two_char_month_string(month)}'


def get_article_date(date):
    utils = Utils()
    date = date.strftime('%m/%d/%Y')
    year  = date.split('/')[2]
    month = date.split('/')[0]
    day   = date.split('/')[1]
    return f'{year}{utils.get_two_char_int_string(month)}{utils.get_two_char_int_string(day)}'