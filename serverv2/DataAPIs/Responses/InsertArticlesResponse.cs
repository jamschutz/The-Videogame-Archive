using System.Collections.Generic;

using VideoGameArchive.Entities;

namespace VideoGameArchive.Responses
{
    public class InsertArticlesResponse
    {
            public List<Article> ArticlesCreated { get; set; }
            public List<string> AuthorsCreated { get; set; }
            public List<string> ArticleTypesCreated { get; set; }
    }
}