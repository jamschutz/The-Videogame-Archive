using System.Linq;
using System.Collections.Generic;

using VideoGameArchive.Entities;

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


        public static string GetUrlsOnRecordFromList(List<Article> articles)
        {
            var articleUrls = articles.Select(a => $"'{a.url}'").ToList();
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
            var writers = articles.Select(a => $"'{a.author}'").ToList();
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
            var articleTypes = articles.Select(a => $"'{a.articleType}'").ToList();
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
    }
}