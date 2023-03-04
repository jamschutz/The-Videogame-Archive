from .._shared.Config import Config


class WebCrawler:
    def __init__(self):
        self.config = Config()


    


    def get_free_proxies(self):
        soup = get_website_soup('https://free-proxy-list.net/')
        
        # create empty list for proxies
        proxies = []

        # find the proxy table, and store the rows
        proxy_table = soup.find('table').tbody.find_all('tr')
        for row in proxy_table:
            try:
                cols = row.find_all('td')
                ip   = cols[0].text.strip()
                port = cols[1].text.strip()

                proxies.append(f'{str(ip)}:{str(port)}')
            except IndexError:
                continue

        return proxies