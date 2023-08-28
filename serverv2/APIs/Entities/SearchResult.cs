using System.Collections.Generic;

namespace VideoGameArchive.Entities
{
    public class SearchResult
    {
        public int articleId { get; set; }
        public int startPos { get; set; }
    }


    public class SearchTermResults
    {
        public string searchTerm { get; set; }
        public List<SearchResult> results { get; set; }
    }
}