$Env:ENVIRONMENT = "prod";
$currentYear = get-date -Format yyyy;

For ($y=1996; $y -le $currentYear; $y++) {
    $Env:YEAR = $y;
    & "eleventy";
}
