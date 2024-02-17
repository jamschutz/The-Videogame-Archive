# WebsiteArchiver

## Setup

To use this tool, you'll need the python library `Beautiful Soup` installed. Just run `pip install beautifulsoup4`.<br/><br/>
You'll also need the html parser `lxml`: `pip install lxml` <br/>
As well as the url normalizer: `pip install url-normalize` <br/>
And pyodbc: `pip install pyodbc`<br/>
And azure: `pip install azure-storage-blob azure-identity`
NOTE: For `pyodbc`, you also need an ODBC Driver installed on your machine. It comes with SSMS, but there's probably another way to download it...<br/>
For pdf stuff, you will need the following libraries:<br/>
```bash
pip install img2pdf
pip install ocrmypdf

choco install --pre tesseract
choco install ghostscript
```
<br/>

You will also need to [install Poppler for Windows](https://blog.alivate.com.au/poppler-windows/) <br/>
When you install it, place it in this path: `C:\Program Files (x86)\Poppler\poppler-0.68.0\bin\pdftoppm.exe`, and add it to your PATH.


## TODO

- Different archive view types (existing vertical, horizontal, etc)

- Fix Virtual Table, use in getting Articles (right now just using raw Article table and joining)

- Create MongoDB for search
- Protect again SQL injection for search

- Move server to azure functions
- Add more websites
- Better search filters (author, website, etc)
- Actual search indexing
- Wayback webpages

- About page
- Home page
- Website page
- Author page

- Optimize searching

- Mobile view



## Notes to self

thinking the 3 webcrawler entrypoints should be: `url_indexer`, `archiver`, `search_indexer` <br/>
https://www.neh.gov/grants/odh/digital-humanities-advancement-grants

azure function that unzips blob uploads:
https://www.frankysnotes.com/2019/02/how-to-unzip-automatically-your-files.html


### Wayback Machine API
https://github.com/internetarchive/wayback/tree/master/wayback-cdx-server#basic-usage

NOTE: No need to store snapshots where the status code isn't `301` or `200`


## List of sites
https://docs.google.com/spreadsheets/d/1tNX5DDV8z8kwRLprMd4WY1AQPN260hw4tQmyLW0t4F0/edit#gid=0


## Sitemap links TODO
https://warpdoor.com/sitemap.xml <br/>
https://jayisgames.com/archives.php <br/>
https://web.archive.org/web/20001121105100/http://www.zdnet.com:80/gamespot/filters/features/0,10851,6013548,00.html <br/>


### PC Gamer
Note: Website started in 2010, magazine in 1993 <br/>
 <br/>
https://www.pcgamer.com/news/archive/ <br/>
https://www.pcgamer.com/reviews/archive/ <br/>


### Eurogamer
https://www.eurogamer.net/archive/2023/02 <br/>


### Waypoint
Note: for some reason seems to not go back farther than 2019 right now. Maybe that's when they got swooped up by Vice? <br/>
 <br/>
https://www.vice.com/en/topic/games-news?page=46 <br/>
https://www.vice.com/en/topic/games-reviews?page=15 <br/>
https://www.vice.com/en/topic/games-features?page=19 <br/>
https://www.vice.com/en/topic/games-opinion?page=16 <br/>
https://www.vice.com/en/topic/games-columns?page=3 <br/>



### Game Informer
News: https://www.gameinformer.com/news?page=2494 <br/>
Reviews: https://www.gameinformer.com/reviews?page=196 <br/>
Features: https://www.gameinformer.com/features?page=505 <br/>

<br/>
Earliest news article: Darksiders Video Brings Your Doom <br/>
Earliest reviews article: Life, The Universe, And Everything <br/>
Earliest feature article: The Rise of 3D Gaming - New PC Tech Coming to Home Consoles <br/>



### IGN

Oldest review from scrolling called: Earth Defense Force 5 Review (2018) <br/>
[Earth Defense Force 5 Review](https://www.ign.com/articles/2018/12/07/earth-defense-force-5-review) <br/>
<br/>
Example older article: https://www.ign.com/articles/2006/09/07/lego-star-wars-ii-the-original-trilogy-review-5

Potentially might be able to reach out here: pressinquiries@ign.com
https://www.reddit.com/r/IGN/comments/yyskl5/is_there_an_easy_way_to_get_a_list_of_every_game/



### Gameplanet

https://www.gameplanet.co.nz/features/page69/ <br/> DONE
https://www.gameplanet.co.nz/previews/page22/ <br/> DONE
https://www.gameplanet.co.nz/reviews/page56/ <br/> DONE
https://www.gameplanet.co.nz/news/page635/ <br/> DONE


### Free Indie Games
https://www.freeindiegam.es/wp-sitemap-posts-post-1.xml
https://www.freeindiegam.es/wp-sitemap-posts-post-2.xml


### Old Man Murray
http://www.oldmanmurray.com/news/news28.html
http://www.oldmanmurray.com/longreviews/
http://www.oldmanmurray.com/shortreviews/sr34.html
http://www.oldmanmurray.com/features/

NOTE: Short reviews seem to not have dedicated urls, which throws a wrench in my DB design....can think of what to do; maybe i can add URL parameters to it...? (site ignores them)



### Terry Cavanagh Blog

https://distractionware.com/blog/page/70/


### The Escapist

think everything before "Welcome to the Lounge" does not need to be archived (they're all empty pages) <br/>
https://www.escapistmagazine.com/category/news/page/3951/


### Reference sites
https://superfamicom.org/
http://snescentral.com/



### Table Architecture
- search term:
    - PartitionKey: {searchTerm}
    - RowKey: {searchTerm}{pool}

- search term metadata:
    - PartitionKey: __metadata
    - RowKey: {searchTerm}


__metadata columns:
    - Total results


### APIs Needed
- Create publication

- Create search key

- Webcrawl function

- Send email!

- Basic search reference: https://bart.degoe.de/building-a-full-text-search-engine-150-lines-of-code/

- SEARCH UPDATES:
    - split tokens by "-" into separate tokens (e.g. "as-yet-contentious" should be split into 3 tokens)