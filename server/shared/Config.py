class Config:
    # api vars
    API_BASE_URL = 'http://127.0.0.1:5000'
    GET_ARTICLES_API = 'Articles'
    GET_ARCHIVED_WEBSITES_API = 'ArchivedWebsites'
    

    # website lookups
    website_id_lookup = {
        'GameSpot': 1,
        'Eurogamer': 2,
        'Gameplanet': 3
    }
    website_name_lookup = {
        1: 'GameSpot',
        2: 'Eurogamer',
        3: 'Gameplanet'
    }