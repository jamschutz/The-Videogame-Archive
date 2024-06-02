:: file host
wt -w 0 -p "Powershell" --title filehost -d V:/_website_backups python -m http.server 5001
:: search apis
wt -w 0 -p "Powershell" --title search-apis -d "V:/The Videogame Archive/serverv2/DataAPIs" func host start
:: open website tab
wt -w 0 -p "Powershell" --title website -d "V:/The Videogame Archive/websitev2"