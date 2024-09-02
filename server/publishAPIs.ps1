$TARGET_FOLDER = "G:/The Videogame Archive/serverv2/PublicAPIs";
$publishFolder = "'${TARGET_FOLDER}/bin/Release/n6.0/publish'";
$publishZip = "'${TARGET_FOLDER}/bin/Release/n6.0/publish/publish.zip'";
$resourceGroup = "website-dev"
$functionAppName = "vga-functionapp-dev"

# Write-Output "building release package...";
# Set-Location -Path $TARGET_FOLDER;
# dotnet publish -c Release

Write-Output "zipping...";
if(Test-path $publishZip) {Remove-item $publishZip}
Add-Type -assembly "system.io.compression.filesystem"
[io.compression.zipfile]::CreateFromDirectory($publishFolder, $publishZip)

# Write-Output "deploying..."
# az functionapp deployment source config-zip `
#  -g $resourceGroup -n $functionAppName --src $publishZip

# REAL ONE: func azure functionapp publish vga-functionapp-dev