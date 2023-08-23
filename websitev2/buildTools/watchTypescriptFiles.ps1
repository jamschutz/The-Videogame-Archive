# folder and filter vars
$folder = "${PSScriptRoot}\..\src\code"
$filter = "*.ts*"

Get-EventSubscriber -SourceIdentifier "FileCreated" -ErrorAction SilentlyContinue | Unregister-Event 
Get-EventSubscriber -SourceIdentifier "FileChanged" -ErrorAction SilentlyContinue | Unregister-Event
Get-EventSubscriber -SourceIdentifier "FileRenamed" -ErrorAction SilentlyContinue | Unregister-Event


$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $folder
$watcher.Filter = $filter
$watcher.IncludeSubdirectories = $false
$watcher.EnableRaisingEvents = $true

### SET FOLDER TO WATCH + FILES TO WATCH + SUBFOLDERS YES/NO
    $watcher = New-Object System.IO.FileSystemWatcher
    $watcher.Path = $folder
    $watcher.Filter = $filter
    $watcher.IncludeSubdirectories = $true
    $watcher.EnableRaisingEvents = $true

    Write-Output("watching folder ${folder}")

### DEFINE ACTIONS AFTER AN EVENT IS DETECTED
    $action = { 
        $path = $Event.SourceEventArgs.FullPath
        $changeType = $Event.SourceEventArgs.ChangeType
        $logline = "$(Get-Date), $changeType, $path"

        # run compiler!
        Write-Output "recompiling!"
        & "${PSScriptRoot}\compile_js.ps1"
        # Invoke-Command -ScriptBlock { & $arge[0] } -ArgumentList $compileScriptPath
    }    

### DECIDE WHICH EVENTS SHOULD BE WATCHED 
Register-ObjectEvent $watcher "Changed" -SourceIdentifier 'FileChanged' -Action $action

while ($true) {sleep 5}

# print output
# $fileChangedJob = Get-Job -Name 'FileChanged' -Newest 1
# $fileChangedJob.Id
# Receive-Job -Id $fileChangedJob.Id -keep 