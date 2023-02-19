import urllib.request, urllib.error, urllib.parse
import requests


url = 'https://www.gamespot.com/articles/miyamoto-talks-dolphin-at-space-world-99/1100-2323742/'
proxy = '34.146.19.255:3128'

proxy_handler = urllib.request.ProxyHandler({'http': proxy, 'https': proxy})
opener = urllib.request.build_opener(proxy_handler)
urllib.request.install_opener(opener)

with urllib.request.urlopen(url) as response:
    print('success')

# proxies = {'http': proxy, 'https': proxy}
# response = urllib.request.urlopen(url, proxies=proxies)
# webContent = response.read().decode('UTF-8')


# with open("output.html", "w") as text_file:
#     text_file.write(webContent)

