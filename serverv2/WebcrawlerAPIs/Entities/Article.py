class Article:
    def __init__(self, id=None, author="", url='', type='', title='', subtitle='', website_id=None, date=None, thumbnail=None, tags=[], author_id=None, type_id=None):
        self.author = author
        self.url = url
        self.type = type
        self.title = title
        self.subtitle = subtitle
        self.website_id = website_id
        self.date = date
        self.thumbnail = thumbnail
        self.id = id
        self.tags = tags
        self.author_id = author_id,
        self.type_id = type_id


    def to_string(self):
        return {
            'title': self.title,
            'subtitle': self.subtitle,
            'url': self.url,
            'date': self.date,
            'author_id': self.author_id,
            'type_id': self.type_id,
            'website_id': self.website_id
        }