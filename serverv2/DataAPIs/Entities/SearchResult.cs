using System;
using System.Collections.Generic;

namespace VideoGameArchive.Entities
{
    public class SearchResult
    {
        public string searchTerm { get; set; }
        public List<int> articleIds { get; set; }
        public List<int> startPositions { get; set; }
    }


    // public class SearchEntry
    // {
    //     public string searchTerm { get; set; }
    //     public List<SearchResult> results { get; set; }
    // }
}