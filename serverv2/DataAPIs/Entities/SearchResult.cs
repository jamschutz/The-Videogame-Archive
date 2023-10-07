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
        public const int MAX_RESULTS_PER_ROW = 5000;

        public string searchTerm { get; set; }        
        public Dictionary<int, List<int>> entries { get; set; }

        public SearchResult()
        {
            entries = new Dictionary<int, List<int>>();
        }

        public Dictionary<int, List<int>> GetEntries(int skip, int take)
        {
            var result = new Dictionary<int, List<int>>();

            foreach(var articleEntry in entries.OrderBy(e => e.Key)) {
                int articleId = articleEntry.Key;
                var startPositions = articleEntry.Value;

                // skip this entire entry if we have to
                if(startPositions.Count < skip) {
                    skip -= startPositions.Count;
                    continue;
                }

                // otherwise, skip and take
                var positionsTaken = startPositions.Skip(skip).Take(take).ToList();
                result[articleId] = positionsTaken;

                skip = 0;
                take -= positionsTaken.Count();

                if(take == 0) {
                    return result;
                }
            }

            return result;            
        }

        public int Count()
        {
            int count = 0;
            foreach(var articleEntry in entries) {
                count += articleEntry.Value.Count;
            }
            return count;
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


    public class SearchResultEntries
    {
        public Dictionary<int, List<int>> entries { get; set; }

        public SearchResultEntries()
        {
            entries = new Dictionary<int, List<int>>();
        }

        public SearchResultEntries(Dictionary<int, List<int>> e)
        {
            entries = e;
        }

        public int Count()
        {
            int count = 0;
            foreach(var articleEntry in entries) {
                count += articleEntry.Value.Count;
            }
            return count;
        }

        public Dictionary<int, List<int>> GetEntries(int skip, int take)
        {
            var result = new Dictionary<int, List<int>>();

            foreach(var articleEntry in entries.OrderBy(e => e.Key)) {
                int articleId = articleEntry.Key;
                var startPositions = articleEntry.Value;

                // skip this entire entry if we have to
                if(startPositions.Count < skip) {
                    skip -= startPositions.Count;
                    continue;
                }

                // otherwise, skip and take
                var positionsTaken = startPositions.Skip(skip).Take(take).ToList();
                result[articleId] = positionsTaken;

                skip = 0;
                take -= positionsTaken.Count();

                if(take == 0) {
                    return result;
                }
            }

            return result;            
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