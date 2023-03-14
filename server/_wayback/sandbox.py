from enum import Enum
from url_normalize import url_normalize
import requests, pathlib, json, os

from .WaybackDbManager import WaybackDbManager
from .._shared.Config import Config
from .._shared.Utils import Utils





if __name__ == '__main__':
    wayback = WaybackUrlManager()
    wayback.save_unique_urls('GameSpot')

    # test_url = 'www.ign.com'
    # wayback = WaybackManager()
    # wayback.save_list_of_urls('www.ign.com', 'IGN')