using System;
using System.Linq;
using System.Collections.Generic;

using Npgsql;

using VideoGameArchive.Entities;
using VideoGameArchive.Core;


namespace VideoGameArchive.Data.DB
{
    public class ArticleTypesManager
    {
        private DbManager dbManager;
        private Func<NpgsqlDataReader, ArticleType> parseWebsiteRow;

        public ArticleTypesManager()
        {
            dbManager = new DbManager();
            parseWebsiteRow = (reader) => {
                var articleType = new ArticleType()
                {
                    id = reader.GetInt32(0),
                    name = reader.GetString(1)
                };
                
                return articleType;
            };
        }


        /* =========================================================== */
        /* ====   GET Methods   ====================================== */
        /* =========================================================== */


        public List<ArticleType> GetArticleTypes()
        {
            string sql =  $@"
                SELECT
                    ""Id"", ""Name""
                FROM
                    ""ArticleTypes""
            ";

            return dbManager.GetQuery<ArticleType>(sql, parseWebsiteRow);
        }
    }
}