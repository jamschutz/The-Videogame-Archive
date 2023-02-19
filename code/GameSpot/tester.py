import json, time
from pathlib import Path
from datetime import datetime

def inner_test(arr):
    for i in range(5):
        arr.pop(0)


def test():
    arr = []
    for i in range(20):
        arr.append(i)

    while len(arr) > 0:
        print(f'front: {arr[0]}')
        inner_test(arr)
        time.sleep(1)
        print('going again! current lenght: ' + str(len(arr)))

test()


# Path('../../archive/1999').mkdir(parents=True, exist_ok=True)

# testdate = datetime.strptime('Sunday, Dec 31, 1987 5:37pm', '%A, %b %d, %Y %I:%M%p')

# year = testdate.strftime("%Y")
# month = testdate.strftime('%m')
# day = testdate.strftime('%d')
# print(f'year: {year}, month: {month}, day: {day}')


# print(is_dir)