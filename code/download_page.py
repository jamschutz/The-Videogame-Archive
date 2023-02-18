import urllib.request, urllib.error, urllib.parse

url = 'https://www.gamespot.com/articles/miyamoto-talks-dolphin-at-space-world-99/1100-2323742/'

response = urllib.request.urlopen(url)
webContent = response.read().decode('UTF-8')

print(webContent)


with open("output.html", "w") as text_file:
    text_file.write(webContent)