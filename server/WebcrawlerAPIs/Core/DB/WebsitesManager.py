import logging

from .DbManager import DbManager
from Entities.Website import Website


class WebsitesManager:

    def __init__(self):
        self.db = DbManager()

    def get_websites(self):
        query = f"""
            SELECT
                "Websites"."Id", "Websites"."Name", "Websites"."Founders", 
                "Websites"."YearStarted", "Websites"."YearEnded", "Websites"."Url", 
                "Websites"."Country", "Websites"."IsActive", "WebsiteTypes"."Name" AS "Type"
            FROM
                "Websites"
            INNER JOIN
                "WebsiteTypes"
            ON
                "WebsiteTypes"."Id" = "Websites"."TypeId"
        """
        results = self.db.get_query(query)

        websites = []
        for w in results:
            websites.append(Website(
                id = w[0],
                name = w[1],
                founders = w[2],
                year_started = w[3],
                year_ended = w[4],
                url = w[5],
                country = w[6],
                is_active = w[7],
                type = w[8]
            ))

        return websites


    def get_id(self, website):
        query = f"""
            SELECT
                "Id"
            FROM
                "Websites"
            WHERE
                "Name" = '{website}'
        """
        return self.db.get_query(query)[0][0]








if __name__ == '__main__':
    websites_manager = WebsitesManager()
    websites = websites_manager.get_websites()

    print(websites_manager.get_id('Eurogamer'))