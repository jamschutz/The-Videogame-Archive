export DOTNET_BUNDLE_EXTRACT_BASE_DIR='/srv/backend/dotnet'
dotnet publish --configuration Release -r linux-x64 -o /srv/backend/article-apis