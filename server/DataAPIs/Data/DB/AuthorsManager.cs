using System;
using System.Linq;
using System.Collections.Generic;

using Npgsql;

using VideoGameArchive.Entities;
using VideoGameArchive.Core;


namespace VideoGameArchive.Data.DB
{
    public class AuthorsManager
    {
        private DbManager dbManager;
        private Func<NpgsqlDataReader, Author> parseAuthorRow;

        public AuthorsManager()
        {
            dbManager = new DbManager();
            parseAuthorRow = (reader) => {
                var author = new Author();
                author.id = reader.GetInt32(0);
                author.name = reader.GetString(1);
                return author;
            };
        }


        /* =========================================================== */
        /* ====   GET Methods   ====================================== */
        /* =========================================================== */


        public List<Author> GetAuthors()
        {
            string sql =  $@"
                SELECT
                    ""Id"", ""Name""
                FROM
                    ""Writers""
                WHERE
                    ""Name"" is not null
            ";

            return dbManager.GetQuery<Author>(sql, parseAuthorRow);
        }
    }
}