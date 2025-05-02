:: read credentials
set /p "client-id=enter client id: "
set /p "client-secret=enter client secret: "
set /p "project-id=enter project id: "

:: file host
wt -w 0 -p "Powershell" --title filehost -d V:/_website_backups python -m http.server 5001
:: search apis
wt -w 0 -p "Powershell" --title search-apis -d "./DataAPIs" dotnet run client-id=%client-id% client-secret=%client-secret% project-id=%project-id%
:: open website tab
wt -w 0 -p "Powershell" --title website -d "V:/The Videogame Archive/website"