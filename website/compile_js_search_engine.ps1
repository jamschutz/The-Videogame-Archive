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
    $filenameStartIndex = $file.IndexOf("/", 8) + 1
    if($filenameStartIndex -eq 0) {
        $filenameStartIndex = 8
    }
    $folderPath = $file.Substring(0, $filenameStartIndex - 1)
    $filename = $file.Substring($filenameStartIndex)
    # Write-Output $folderPath
    # Write-Output $filename
    # Write-Output "--container-name $($containerName)/$($folderPath) --file $($filename)"
    az storage blob upload --account-name $storageAccountName --container-name "${containerName}/${folderPath}" --file $file --name $filename --content-type "text/javascript"
}


Write-Output "done"