using System.Collections.Generic;

using VideoGameArchive.Entities;

namespace VideoGameArchive.Requests
{
    public class GetSearchResultsRequest
    {
        public string[] searchTerms { get; set; }
        public int resultsPerPage { get; set; }
        public int page { get; set; }
        public ArticleFilter filter { get; set; }
    }
}