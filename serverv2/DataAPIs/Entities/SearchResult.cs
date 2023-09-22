using System;
using System.Collections.Generic;

using VideoGameArchive.Core;

namespace VideoGameArchive.Entities
{
    public class SearchResult
    {
        public const int MAX_RESULTS_PER_ROW = 3000;

        public string searchTerm { get; set; }
        public List<int> articleIds { get; set; }
        public List<int> startPositions { get; set; }
    }

    public class SearchResultBin
    {
        public string searchTerm { get; set; }
        public List<SearchResultEntry> entries { get; set; }
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


    public class SearchResultCompressed
    {
        public string searchTerm;
        public Dictionary<int, List<int>> articleIdPositions;


        public SearchResultCompressed(string searchTerm, List<SearchResultEntry> results)
        {
            this.searchTerm = searchTerm;
            articleIdPositions = new Dictionary<int, List<int>>();
            if(results == null || results.Count == 0) {
                return;
            }

            foreach(var s in results) {
                int id = s.articleId;
                int pos = s.startPosition;

                if(!articleIdPositions.ContainsKey(id)) {
                    articleIdPositions[id] = new List<int>();
                }

                articleIdPositions[id].Add(pos);
            }
            
        }
    }
}