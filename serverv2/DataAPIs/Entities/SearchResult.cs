using System;
using System.Linq;
using System.Collections.Generic;

using VideoGameArchive.Core;

namespace VideoGameArchive.Entities
{
    public class SearchResult
    {
        public const int MAX_RESULTS_PER_ROW = 3000;

        public string searchTerm { get; set; }        
        public Dictionary<int, List<int>> entries { get; set; }

        public SearchResult()
        {
            entries = new Dictionary<int, List<int>>();
        }



        public void Extend(Dictionary<int, List<int>> newEntries)
        {
            foreach(var entry in newEntries) {
                var articleId = entry.Key;
                var startPositions = entry.Value;

                if(!entries.ContainsKey(articleId)) {
                    entries[articleId] = new List<int>();
                }

                var newStartPositions = startPositions.Where(p => entries[articleId].All(x => x != p)).ToList();
                entries[articleId].AddRange(newStartPositions);
            }
        }

        public void Extend(SearchResult extraSearchResult)
        {
            Extend(extraSearchResult.entries);
        }

        public void ExtendFast(Dictionary<int, List<int>> newEntries)
        {
            foreach(var entry in newEntries) {
                var articleId = entry.Key;
                var startPositions = entry.Value;

                if(!entries.ContainsKey(articleId)) {
                    entries[articleId] = new List<int>();
                }

                entries[articleId].AddRange(startPositions);
            }
        }

        public void ExtendFast(SearchResult extraSearchResult)
        {
            Extend(extraSearchResult.entries);
        }
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


    // public class SearchResultCompressed
    // {
    //     public string searchTerm;
    //     public Dictionary<int, List<int>> articleIdPositions;


    //     public SearchResultCompressed(string searchTerm, List<SearchResultEntry> results)
    //     {
    //         this.searchTerm = searchTerm;
    //         articleIdPositions = new Dictionary<int, List<int>>();
    //         if(results == null || results.Count == 0) {
    //             return;
    //         }

    //         foreach(var s in results) {
    //             int id = s.articleId;
    //             int pos = s.startPosition;

    //             if(!articleIdPositions.ContainsKey(id)) {
    //                 articleIdPositions[id] = new List<int>();
    //             }

    //             articleIdPositions[id].Add(pos);
    //         }
            
    //     }
    // }
}