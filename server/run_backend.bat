:: read credentials
set /p "client-id=enter client id: "
set /p "client-secret=enter client secret: "
set /p "project-id=enter project id: "
set environment=dev

:: file host
wt -w 0 -p "Powershell" --title filehost -d F:/VideogameArchive/_website_backups python -m http.server 5001
:: search apis
wt -w 0 -p "Powershell" --title search-apis -d "./DataAPIs" dotnet run %client-id%_%client-secret%_%project-id%_%environment%
:: open website tab
wt -w 0 -p "Powershell" --title website -d "../website"