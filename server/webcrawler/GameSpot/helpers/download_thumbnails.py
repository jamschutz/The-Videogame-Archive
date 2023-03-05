import requests
from server._shared.Config import Config
from server._shared.DbManager import DbManager
from server._shared.Utils import Utils

config = Config()
db = DbManager()

def save_image(url):



img_data = requests.get(image_url).content
with open('image_name.jpg', 'wb') as handler:
    handler.write(img_data)