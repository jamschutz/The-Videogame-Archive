$javascriptFiles = az storage blob directory list -c "`$web" -d "code" --account-name "vgastorageaccountdev"

$filesToUpdate = @()
Foreach ($file in $javascriptFiles)
{
    $filename = ''
    $filenameMatch = $file -match '.*name": "(.*?)".*'
    if ($filenameMatch) {
        $filesToUpdate += $matches[1]
    }
    else {
        $filename = 'not found'
    }
    
}
Write-Output $filesToUpdate


Foreach ($file in $filesToUpdate){ 
    az storage blob update --account-name "vgastorageaccountdev" --container-name "`$web" --name $file --content-type "text/javascript"
}