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

Write-Output "done"

& "python" "-m" "http.server"