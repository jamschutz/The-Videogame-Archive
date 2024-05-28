class Article:
    def __init__(self, id=None, author="", url='', type='', title='', subtitle='', website_id=None, date=None, thumbnail=''):
        self.author = author
        self.url = url
        self.type = type
        self.title = title
        self.subtitle = subtitle
        self.website_id = website_id
        self.date = date
        self.thumbnail = thumbnail
        self.id = id


    def to_string(self):
        return {
            'title': self.title,
            'subtitle': self.subtitle,
            'url': self.url,
            'date': self.date
        }