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


        public static string GetDatesWithArticles(string start, string end)
        {
            return $@"
                SELECT
                    DatePublished
                FROM
                    Article
                WHERE
                    DatePublished >= {start} AND DatePublished <= {end}
                GROUP BY DatePublished
            ";
        }
    }
}