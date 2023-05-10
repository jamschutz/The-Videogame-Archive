$files = @()
# classes
$files += "code/js/entities/CalendarDate.js"
$files += "code/js/entities/Article.js"

$files += "code/js/shared/Utils.js"
$files += "code/js/shared/Config.js"    
$files += "code/js/shared/DataManager.js"
$files += "code/js/shared/UrlParser.js"

$files += "code/js/responses/SearchResponse.js"
$files += "code/js/requests/SearchRequest.js"

$files += "code/js/ui/SearchBar.js"
$files += "code/js/ui/SearchResult.js"

# main
$files += "code/js/searchEngine.js"


$storageAccountName = "vgastorageaccountdev"
$containerName = "`$web"
Write-Output "uploading to azure..."

Foreach ($file in $files) {
    az storage blob upload --overwrite --account-name $storageAccountName --container-name "${containerName}/code/js" --file $file --name "vga_archive.js" --content-type "text/javascript"
}


Write-Output "done"