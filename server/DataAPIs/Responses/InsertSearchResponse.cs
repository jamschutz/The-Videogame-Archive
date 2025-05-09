using System.Collections.Generic;

using VideoGameArchive.Entities;

namespace VideoGameArchive.Responses
{
    public class InsertSearchResultsResponse
    {
        public List<SearchResultsInserted> Results { get; set; }

        public InsertSearchResultsResponse()
        {
            Results = new List<SearchResultsInserted>();
        }
    }


    public class SearchResultsInserted
    {
        public required string SearchTerm { get; set; }
        public required List<int> ArticleIdsAdded { get; set; }
    }
}