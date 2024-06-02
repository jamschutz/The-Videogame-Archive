using System;
using System.Linq;
using System.Text;
using System.Threading;
using System.Collections.Generic;

using Newtonsoft.Json;

using Azure;
using Azure.Data.Tables;
using Azure.Data.Tables.Models;

using Microsoft.Extensions.Logging;

using VideoGameArchive.Entities;
using VideoGameArchive.Core;
using Microsoft.AspNetCore.WebUtilities;


namespace VideoGameArchive.Data
{
    public class SearchTableManager
    {
        private TableClient searchTableClient;
        private TableClient searchMetadataTableClient;
        private const string SearchTableName = "searchResults";
        private const string SearchMetadataTableName = "searchResultsMetadata";
        private ILogger log;

        private readonly JsonSerializerSettings SerializerSettings = new JsonSerializerSettings
        {
            TypeNameHandling = TypeNameHandling.Auto,
        };

        public SearchTableManager(ILogger logger)
        {
            log = logger;
            searchTableClient = new TableClient(Secrets.SearchTableConnectionString, SearchTableName);
            searchMetadataTableClient = new TableClient(Secrets.SearchTableConnectionString, SearchMetadataTableName);
        }


        /* =========================================================== */
        /* ====   Get Methods   ====================================== */
        /* =========================================================== */

        public List<int> GetSearchResultEntries(string searchTerm)
        {
            searchTerm = Utils.GetEscapedString(searchTerm);
            var metadata = GetSearchResultMetadata(searchTerm);
            return GetSearchResultEntriesFromQuery($"PartitionKey eq '{searchTerm}'");
        }

        // public List<int> GetSearchResultEntries(string searchTerm, int resultsPerPage, int pageNumber)
        // {
        //     var metadata = GetSearchResultsMetadata(searchTerm);
        //     long maxPage = metadata == null? 0 : metadata.totalResults / SearchResult.MAX_RESULTS_PER_ROW;

        //     int start = resultsPerPage * (pageNumber - 1);
        //     int end = start + resultsPerPage;
        //     int startRow = start / SearchResult.MAX_RESULTS_PER_ROW;
        //     int endRow = end / SearchResult.MAX_RESULTS_PER_ROW;

        //     var pages = Enumerable.Range(startRow, (endRow - startRow) + 1).ToList();
        //     var results = GetSearchResultEntries(searchTerm, pages);
        //     return results;
        // }
        // private Dictionary<int, List<int>> GetSearchResultEntries(string searchTerm, List<int> pageNumbers)
        // {
        //     // build odata query
        //     searchTerm = Utils.GetEscapedString(searchTerm);
        //     var rowKeyQueries = pageNumbers.Select(p => $"RowKey eq '{p}'").ToList();
        //     string odataQuery = string.Join(" or ", rowKeyQueries);
        //     return GetSearchResultEntriesFromQuery($"PartitionKey eq '{searchTerm}' and ({odataQuery})");
        // }
        // private List<SearchResultEntry> GetSearchResultEntries(string searchTerm, int pageNumber)
        // {
        //     return GetSearchResultEntriesFromQuery($"PartitionKey eq '{searchTerm}{pageNumber.ToString()}'");
        // }
        private List<int> GetSearchResultEntriesFromQuery(string queryFilter)
        {
            Pageable<TableEntity> query = searchTableClient.Query<TableEntity>(filter: queryFilter);

            var results = new List<int>();
            foreach (TableEntity entity in query)
            {
                var entriesBinary = entity.GetBinary("ArticleIds");
                var entries = DeserializeFromByteArray<List<int>>(entriesBinary);
                results.AddRange(entries);
            }
            return results;
        }

        // // private Dictionary<int, List<int>> GetSearchResultEntriesToAdd(string searchTerm, Dictionary<int, List<int>> entries)
        // // {
        // //     // get existing article ids
        // //     var existingEntries = GetSearchResultEntries(searchTerm);

        // //     // if no existing entry, just return all entries to add
        // //     if(existingEntries == null)
        // //         return entries;

        // //     // get entries that don't already exist
        // //     var entriesToAdd = new Dictionary<int, List<int>>();
        // //     foreach(var entry in entries) {
        // //         var articleId = entry.Key;
        // //         var startPositions = entry.Value;

        // //         if(existingEntries.ContainsKey(articleId)) {
        // //             var newStartPositions = startPositions.Where(p => existingEntries[articleId].All(x => x != p)).ToList();
        // //             if(newStartPositions.Count > 0) {
        // //                 entriesToAdd[articleId] = newStartPositions;
        // //             }
        // //         }
        // //         else {
        // //             entriesToAdd[articleId] = startPositions;
        // //         }
        // //     }

        // //     // and return
        // //     return entriesToAdd;
        // // }

        // private Dictionary<int, List<int>> GetSearchResultEntriesToAdd(string searchTerm, List<SearchResultEntry> entries)
        // {
        //     var formattedEntries = new Dictionary<int, List<int>>();
        //     foreach(var e in entries) {
        //         if(!formattedEntries.ContainsKey(e.articleId)) {
        //             formattedEntries[e.articleId] = new List<int>();
        //         }
        //         formattedEntries[e.articleId].Add(e.startPosition);
        //     }
        //     return GetSearchResultEntriesToAdd(searchTerm, formattedEntries);
        // }


        // private List<int> GetArticleIdsToAddForSearchTerm(string searchTerm, List<int> articleIds)
        // {

        // }


        public SearchResultMetadata GetSearchResultMetadata(string searchTerm)
        {
            return GetSearchResultsMetadata(new List<string>() { searchTerm })[0];
        }
        public List<SearchResultMetadata> GetSearchResultsMetadata(List<string> searchTerms)
        {
            // build odata query
            var partitionKeyQueries = searchTerms.Select(s => $"PartitionKey eq '{Utils.GetEscapedString(s)}'").ToList();
            string odataQuery = string.Join(" or ", partitionKeyQueries);

            // fetch query results from table
            Pageable<TableEntity> query = searchMetadataTableClient.Query<TableEntity>(filter: odataQuery);
            var metadata = new List<SearchResultMetadata>();
            var existingMetadataEntries = new HashSet<string>();

            // parse to list
            foreach (TableEntity entity in query)
            {
                string searchTerm = entity.GetString("SearchTerm");
                long? totalResults = entity.GetInt64("TotalResults");
                
                if(totalResults.HasValue) {
                    metadata.Add(new SearchResultMetadata() { 
                        searchTerm = searchTerm,
                        totalResults = totalResults.Value 
                    });
                    existingMetadataEntries.Add(searchTerm);
                }
            }

            // create new metadata entries for terms that don't have one
            foreach(var searchTerm in searchTerms) {
                // if metadata exists, ignore
                if(existingMetadataEntries.Contains(searchTerm)) {
                    continue;
                }

                // otherwise, create entry
                var newMetadataEntry = new TableEntity(searchTerm, searchTerm) {
                    { "SearchTerm", searchTerm },
                    { "TotalResults", (long)0 }
                };
                UpsertMetadataEntity(newMetadataEntry);
                metadata.Add(new SearchResultMetadata() {
                    searchTerm = searchTerm,
                    totalResults = 0
                });
            }

            return metadata;
        }





        /* =========================================================== */
        /* ====   Insert Methods   =================================== */
        /* =========================================================== */

        public List<int> InsertSearchResult(string searchTerm, List<int> articleIds, SearchResultMetadata metadata)
        {
            // // get entries we haven't already stored
            // var entriesToAdd = GetSearchResultEntriesToAdd(searchTerm, entries);
            var articleIdsToAdd = articleIds;

            // if no entries to add, just return
            if(articleIdsToAdd.Count == 0)
                return articleIdsToAdd;

            // build partition keys
            int poolIndex = (int)(metadata.totalResults / (long)SearchResult.MAX_RESULTS_PER_ROW);
            var partitionKey = $"{searchTerm}";
            var rowKey = $"{poolIndex}";

            // check if entity exists
            var existingEntity = GetSearchTermEntity(partitionKey, rowKey);

            // store existing entries (if we have any)
            List<int> existingArticleIds = new List<int>();
            if(existingEntity.HasValue) {
                var existingArticleIdsBinary = existingEntity.Value.GetBinary("ArticleIds");
                existingArticleIds = DeserializeFromByteArray<List<int>>(existingArticleIdsBinary);
            }

            // if there are more entries to add than we have room in our pool, we'll have to add in batches
            if(existingArticleIds.Count + articleIdsToAdd.Count > SearchResult.MAX_RESULTS_PER_ROW) {
                int skip = 0; 
                int take = SearchResult.MAX_RESULTS_PER_ROW - existingArticleIds.Count();
                while(skip < articleIdsToAdd.Count()) {
                    // add to existing
                    existingArticleIds.AddRange(articleIdsToAdd.Skip(skip).Take(take).ToArray());
                    // update table entity
                    var articleIdsByteArray = SerializeToByteArray<List<int>>(existingArticleIds);
                    UpsertTableEntity(new TableEntity(partitionKey, rowKey) {
                        { "ArticleIds", articleIdsByteArray }
                    });
                    
                    skip += take;
                    take = SearchResult.MAX_RESULTS_PER_ROW;
                    poolIndex++;
                    rowKey = $"{poolIndex}";
                    existingArticleIds = new List<int>();
                }
            }
            // otherwise, we can just append all entries to add to our existing list
            else {
                existingArticleIds.AddRange(articleIdsToAdd);

                // update table entity
                var articleIdsByteArray = SerializeToByteArray<List<int>>(existingArticleIds);
                UpsertTableEntity(new TableEntity(partitionKey, rowKey) {
                    { "ArticleIds", articleIdsByteArray }
                });
            }

            // update metadata
            var updatedMetadata = new TableEntity(searchTerm, searchTerm) {
                { "TotalResults", metadata.totalResults + articleIdsToAdd.Count }
            };
            UpsertMetadataEntity(updatedMetadata);

            // return article ids we added
            return articleIdsToAdd;
        }


        // // public void InsertSearchResults(List<SearchResult> searchResults)
        // // {
        // //     foreach(var searchResult in searchResults) {
        // //         InsertSearchResult(searchResult);
        // //     }
        // // }

        public List<int> InsertSearchResult(string searchTerm, List<int> articleIds)
        {
            var metadata = GetSearchResultsMetadata(new List<string>() { searchTerm });
            return InsertSearchResult(searchTerm, articleIds, metadata[0]);
        }





        /* =========================================================== */
        /* ====   Helper Methods   ===================================== */
        /* =========================================================== */

        private void UpsertTableEntity(TableEntity entity)
        {
            searchTableClient.UpsertEntity(entity);
        }

        private void UpsertMetadataEntity(TableEntity entity)
        {
            searchMetadataTableClient.UpsertEntity(entity);
        }

        private NullableResponse<TableEntity> GetSearchTermEntity(string partitionKey, string rowKey)
        {
            return searchTableClient.GetEntityIfExists<TableEntity>(partitionKey, rowKey, null, new CancellationToken());
        }


        // taken from: https://stackoverflow.com/a/66106760
        public byte[] SerializeToByteArray<T>(T source)
        {
            var asString = JsonConvert.SerializeObject(source, SerializerSettings);
            return Encoding.Unicode.GetBytes(asString);
        }

        public T DeserializeFromByteArray<T>(byte[] source)
        {
            var asString = Encoding.Unicode.GetString(source);
            return JsonConvert.DeserializeObject<T>(asString);
        }

    }
    
}