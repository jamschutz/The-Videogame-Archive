$Env:ENVIRONMENT = "prod";
$currentYear = get-date -Format yyyy;
$Env:OS = "windows";

For ($y=1996; $y -le 1997; $y++) {
    $Env:YEAR = $y;
    & "eleventy";
}
