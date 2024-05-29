class Website:
    def __init__(self, id=None, name='', founders='', year_started=None, year_ended=None, url='', country='', is_active=None, type=''):
        self.id = id
        self.name = name
        self.founders = founders
        self.year_started = year_started
        self.year_ended = year_ended
        self.url = url
        self.country = country
        self.is_active = is_active
        self.type = type


    def to_string(self):
        return {
            'id': self.id,
            'name': self.name,
            'founders': self.founders,
            'started': self.year_started,
            'ended': self.year_ended,
            'url': self.url,
            'country': self.country,
            'active': self.is_active,
            'type': self.type
        }