using System;
using System.Linq;
using System.Collections.Generic;

using VideoGameArchive.Core;

namespace VideoGameArchive.Entities
{
    public class SearchResult
    {
        // azure table storage column size limit is 64kb
        // each entry could in theory be worth 8 bytes (if we only have one entry for every unique article)
        // which means we can store 64k / 8 ==> 8k entries
        // just giving ourselves a little upper buffer (and not sure if it's bad to max out each column...)
        // so going to say each row should only store 5k entries
        public const int MAX_RESULTS_PER_ROW = 3000;

        public string searchTerm { get; set; }        
        public List<int> articleIds { get; set; }

        public SearchResult()
        {
            articleIds = new List<int>();
        }
    }
}