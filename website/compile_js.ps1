Write-Output "compiling typescript..."
& "tsc"
if($LastExitCode -ne 0) {
    Write-Output "error compiling typescript! bailing"
    Return
}


Write-Output "combining js to a single file..."
& "python" "./compiler/compiler.py"
if($LastExitCode -ne 0) {
    Write-Output "error combining javascript files! bailing"
    Return
}

Write-Output "minifying js..."
& "uglifyjs" "compiler/tmp/compiled.js" "--output" "code/js/vga_archive.js"
if($LastExitCode -ne 0) {
    Write-Output "error minifying javascript files! bailing"
    Return
}

$storageAccountName = "vgastorageaccountdev"
$containerName = "`$web"
Write-Output "uploading to azure..."
# az storage blob upload -f "code/js/vga_archive.js" -c "${containerName}/code/js" -n "vga_archive.js"
az storage blob upload --account-name $storageAccountName --container-name "${containerName}/code/js" --file "code/js/vga_archive.js" --name "vga_archive.js" --content-type "text/javascript"


Write-Output "done"

& "python" "-m" "http.server"