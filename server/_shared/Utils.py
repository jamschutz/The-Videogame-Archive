class Utils:
    def get_two_char_int_string(self, n):
        if(n < 10):
            return f'0{str(n)}'
        else:
            return str(n)