using System.Linq;
using System.Collections.Generic;

using VideoGameArchive.Entities;

namespace VideoGameArchive.Data
{
    public static class SQLScripts
    {

        /* =========================================================== */
        /* ====   Get Methods   ====================================== */
        /* =========================================================== */


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


        public static string GetUrlsOnRecordFromList(List<Article> articles)
        {
            var articleUrls = articles.Select(a => $"'{GetEscapedChars(a.url)}'").ToList();
            return $@"
                SELECT
                    Url
                FROM
                    ArticleUrl
                WHERE
                    Url
                IN
                    ({string.Join(',', articleUrls)})
            ";
        }


        public static string GetWritersOnRecordFromList(List<Article> articles)
        {
            var writers = articles.Select(a => $"'{GetEscapedChars(a.author)}'").ToList();
            return $@"
                SELECT
                    Name
                FROM
                    Writer
                WHERE
                    Name
                IN
                    ({string.Join(',', writers)})
            ";
        }


        public static string GetArticleTypesOnRecordFromList(List<Article> articles)
        {
            var articleTypes = articles.Select(a => $"'{GetEscapedChars(a.articleType)}'").ToList();
            return $@"
                SELECT
                    Name
                FROM
                    ArticleType
                WHERE
                    Name
                IN
                    ({string.Join(',', articleTypes)})
            ";
        }





        /* =========================================================== */
        /* ====   Insert Methods   =================================== */
        /* =========================================================== */


        public static string InsertAuthors(List<string> authors)
        {
            var writersFormatted = authors.Select(a => $"('{GetEscapedChars(a)}')").ToList();
            return $@"
                INSERT INTO 
                    Writer (Name) 
                VALUES
                    {string.Join(',', writersFormatted)}
             ";
        }


        public static string InsertArticleTypes(List<string> articleTypes)
        {
            var articleTypesFormatted = articleTypes.Select(a => $"('{GetEscapedChars(a)}')").ToList();
            return $@"
                INSERT INTO 
                    ArticleType (Name) 
                VALUES
                    {string.Join(',', articleTypesFormatted)}
             ";
        }





        /* =========================================================== */
        /* ====   Helper Methods   =================================== */
        /* =========================================================== */


        public static string GetEscapedChars(string query)
        {
            return query.Replace("'", "''");
        }
    }
}