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


        public static string GetThumbnailsOnRecordFromList(List<Article> articles)
        {
            var thumbnails = articles.Where(a => !string.IsNullOrEmpty(a.thumbnail)).Select(a => $"'{GetEscapedChars(a.thumbnail)}'").ToList();
            return $@"
                SELECT
                    Filename
                FROM
                    Thumbnail
                WHERE
                    Filename
                IN
                    ({string.Join(',', thumbnails)})
            ";
        }


        public static string GetWebsiteIds()
        {
            return $@"
                SELECT
                    Id, Name
                FROM
                    Publication
            ";
        }


        public static string GetUrlIds(List<Article> articles)
        {
            var urlsFormatted = articles.Select(a => $"'{GetEscapedChars(a.url)}'").ToList();
            return $@"
                SELECT
                    Id, Url
                FROM
                    ArticleUrl
                WHERE
                    Url
                IN
                    ({string.Join(',', urlsFormatted)})
            ";
        }


        public static string GetAuthorIds(List<Article> articles)
        {
            var authorsFormatted = articles.Select(a => $"'{GetEscapedChars(a.author)}'").ToList();
            return $@"
                SELECT
                    Id, Name
                FROM
                    Writer
                WHERE
                    Name
                IN
                    ({string.Join(',', authorsFormatted)})
            ";
        }


        public static string GetArticleTypeIds(List<Article> articles)
        {
            var articleTypesFormatted = articles.Select(a => $"'{GetEscapedChars(a.articleType)}'").ToList();
            return $@"
                SELECT
                    Id, Name
                FROM
                    ArticleType
                WHERE
                    Name
                IN
                    ({string.Join(',', articleTypesFormatted)})
            ";
        }


        public static string GetArticleIdsWithUrls(List<int> urlIds)
        {
            return $@"
                SELECT
                    Id, UrlId
                FROM
                    Article
                WHERE
                    UrlId
                IN
                    ({string.Join(',', urlIds)})
            ";
        }


        public static string GetArticleIds(List<Article> articles)
        {
            var urlsFormatted = articles.Select(a => $"'{GetEscapedChars(a.url)}'").ToList();
            return $@"
                SELECT
                    Article.Id, ArticleUrl.Url
                FROM
                    Article
                INNER JOIN
                    ArticleUrl
                ON
                    Article.UrlId = ArticleUrl.Id
                WHERE
                    ArticleUrl.Url
                IN
                    ({string.Join(',', urlsFormatted)})
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


        public static string InsertUrls(List<Article> articles)
        {
            var urls = articles.Select(a => $"('{GetEscapedChars(a.url)}')").ToList();
            return $@"
                INSERT INTO 
                    ArticleUrl (Url) 
                VALUES
                    {string.Join(',', urls)}
             ";
        }


        public static string InsertArticles(List<Article> articles, Dictionary<string, int> websiteIds, Dictionary<string, int> urlIds, Dictionary<string, int> authorIds, Dictionary<string, int> articleTypeIds)
        {
            var articlesFormatted = articles.Select(a => 
                $"('{GetEscapedChars(a.title)}', '{GetEscapedChars(a.subtitle)}', {urlIds[a.url]}, {authorIds[a.author]}, {websiteIds[a.website]}, {a.datePublished}, {articleTypeIds[a.articleType]}, 0)"
            ).ToList();
            return $@"
                INSERT INTO 
                    Article (Title, Subtitle, UrlId, AuthorId, WebsiteId, DatePublished, ArticleTypeId, IsArchived) 
                VALUES
                    {string.Join(',', articlesFormatted)}
             ";
        }


        public static string InsertThumbnails(List<Article> articles, Dictionary<string, int> articleIds)
        {
            var thumbnailsFormatted = articles.Select(a => 
                $"({articleIds[a.url]}, '{GetEscapedChars(a.thumbnail)}')"
            ).ToList();
            return $@"
                INSERT INTO 
                    Thumbnail (ArticleId, Filename) 
                VALUES
                    {string.Join(',', thumbnailsFormatted)}
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