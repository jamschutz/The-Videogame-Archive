using System.Collections.Generic;

using VideoGameArchive.Entities;

namespace VideoGameArchive.Requests
{
    public class GetSearchResultsRequest
    {
        public required string[] searchTerms { get; set; }
        public int resultsPerPage { get; set; }
        public int page { get; set; }
        public required ArticleFilter filter { get; set; }


        public bool IsValid()
        {
            return searchTerms != null && searchTerms.Length > 0;
        }
    }
}