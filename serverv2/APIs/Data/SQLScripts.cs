namespace VideoGameArchive.Data
{
    public static class SQLScripts
    {
        public static string GetArticlesForDate(string date)
        {
            return $@"
                SELECT 
                    Title, Subtitle, DatePublished, Thumbnail, Website, Url, Type, Author
                FROM 
                    vArticle
                WHERE
                    DatePublished = {date}
            ";
        }
    }
}