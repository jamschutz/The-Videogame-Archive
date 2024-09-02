using System.Collections.Generic;

using VideoGameArchive.Entities;

namespace VideoGameArchive.Responses
{
    public class InsertSearchResultsRequest
    {
        public string searchTerm { get; set; }
        public List<int> articleIds { get; set; }
    }
}