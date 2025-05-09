# read environment from commandline
env=$1
if [[ "$env" == "" ]]; then
    env='dev'
fi

# set target dir based on environment
if [[ "$env" == "prod" ]]; then
    dest='/srv/backend/article-apis'
else
    dest='../../../srv/backend/article-apis'
fi

# build 
dotnet publish --configuration Release -r linux-x64

# and publish to dest
cp -rf ./bin/Release/net9.0/linux-x64/* $dest