class Article:
    def __init__(self, id=None, author="", url='', type='', title='', subtitle='', website_id=None, date=None, thumbnail_url=None, tags=[], author_id=None, type_id=None, thumbnail_filename=None):
        self.author = author
        self.url = url
        self.type = type
        self.title = title
        self.subtitle = subtitle
        self.website_id = website_id
        self.date = date
        self.thumbnail_url = thumbnail_url
        self.id = id
        self.tags = tags
        self.author_id = author_id
        self.type_id = type_id
        self.thumbnail_filename = thumbnail_filename


    def to_string(self):
        return {
            'title': self.title,
            'subtitle': self.subtitle,
            'url': self.url,
            'date': self.date,
            'author': self.author,
            'author_id': self.author_id,
            'type_id': self.type_id,
            'website_id': self.website_id
        }


    def update_title_and_subtitle_for_sql(self):
        # update ' --> ''
        self.title = self.title.replace("'", "''")
        self.subtitle = self.subtitle.replace("'", "''")

        # if subtitle is too long, just truncate and slap an ellipses on it
        if len(self.subtitle) > 250:
            truncate_index = 246

            # if we're truncating an apostophe, it will cause string parsing issues...back up until we're safe
            while self.subtitle[truncate_index] == "'":
                truncate_index -= 1

            # and truncate
            self.subtitle = f"{self.subtitle[:truncate_index]}..."
