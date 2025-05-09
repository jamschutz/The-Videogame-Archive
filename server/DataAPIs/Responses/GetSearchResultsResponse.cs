using System.Collections.Generic;

using VideoGameArchive.Entities;

namespace VideoGameArchive.Responses
{
    public class GetSearchResultsResponse
    {
        public int TotalResults { get; set; }
        public required List<Article> Results { get; set; }
    }
}