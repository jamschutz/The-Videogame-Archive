# change these values
$websiteName = "JayIsGames"
$startDate = '2003/04'
$endDate = '2023/03'

$storageAccountName = "vgastorageaccountdev"
$containerName = "`$web"





# parse date info
$startYear  = [int](($startDate -split "/")[0])
$startMonth = [int](($startDate -split "/")[1])

$endYear  = [int](($endDate -split "/")[0])
$endMonth = [int](($endDate -split "/")[1])

$year = $startYear
$month = $startMonth

while(($year * 100 + $month) -le ($endYear * 100 + $endMonth)) 
{
    # make sure month is 2 characters
    $monthString = [string]$month
    if($monthString.length -eq 1) {
        $monthString = "0${monthString}"
    }

    # build source folders
    $targetFolder = "/_website_backups/${websiteName}/${year}/${monthString}"
    $thumbnailsFolder = "/_website_backups/${websiteName}/_thumbnails/${year}/${monthString}"
    
    # build destination folders
    $htmlDestination = "${containerName}/archive/${websiteName}/${year}/${monthString}"
    $thumbnailDestination = "${containerName}/archive/${websiteName}/_thumbnails/${year}/${monthString}"

    # upload source folder contents to azure    
    if (Test-Path -Path $targetFolder) {
        Write-Output "uploading for month ${month}/${year}..."
        az storage blob upload-batch -d $htmlDestination -s $targetFolder --account-name $storageAccountName --content-type "text/html"
    }
    else {
        # Write-Output "no webpages found for ${month}/${year}"
        Write-Output "no folder found with path: ${targetFolder}"
    }

    # if we have thumbnails for this month, upload them
    if (Test-Path -Path $thumbnailsFolder) {
        az storage blob upload-batch -d $thumbnailDestination -s $thumbnailsFolder --account-name $storageAccountName
    }
    else {
        Write-Output "no thumbnails found for month ${month}/${year}"
    }


    $month++
    if($month -gt 12) {
        $month = 1
        $year++
    }
}