using System;
using System.Collections.Generic;

using VideoGameArchive.Core;

namespace VideoGameArchive.Entities
{
    public class SearchResult
    {
        public string searchTerm { get; set; }
        public List<int> articleIds { get; set; }
        public List<int> startPositions { get; set; }
    }


    public class SearchResultEntry
    {
        public int articleId { get; set; }
        public int startPosition { get; set; }


        public long GetHash()
        {
            return Utils.GetTwoIntHash(articleId, startPosition);
        }
    }
}