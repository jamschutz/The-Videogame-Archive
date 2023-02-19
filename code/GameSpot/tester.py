

def inner_test(arr):
    for i in range(5):
        arr.pop(0)


def test():
    arr = []
    for i in range(20):
        arr.append(i)

    while len(arr) > 0:
        inner_test(arr)

        print('going again! current lenght: ' + str(len(arr)))

test()