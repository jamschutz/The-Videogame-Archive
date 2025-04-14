export ENVIRONMENT ='prod'
export OS='linux'
export currentYear=$(date +%Y)

for y in `seq 1996 $currentYear`
do
    export YEAR=$y
    eleventy
done