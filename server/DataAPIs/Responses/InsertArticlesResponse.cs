using System.Collections.Generic;

using VideoGameArchive.Entities;

namespace VideoGameArchive.Responses
{
    public class InsertArticlesResponse
    {
        public required List<Article> ArticlesCreated { get; set; }
        public required List<string> AuthorsCreated { get; set; }
        public required List<string> ArticleTypesCreated { get; set; }
        public required List<string> ThumbnailsCreated { get; set; }
    }
}