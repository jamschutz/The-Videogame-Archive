$startYear = 1996;
$endYear = 2023;

$storageAccountName = "vgastorageaccountdev"
$containerName = "`$web"
$srcDir = "F:\The Videogame Archive\websitev2\_site"

Write-Host $srcDir
azcopy copy "${srcDir}\1996" "https://${storageAccountName}.blob.core.windows.net/${containerName}" --recursive

# for($year = $startYear; $year -le $endYear; $year++) {
#     Write-Host $year
#     # az storage blob upload --account-name $storageAccountName --container-name "${containerName}/code/js" --file "code/js/vga_archive.js" --name "vga_archive.js" --content-type "text/javascript"
# }