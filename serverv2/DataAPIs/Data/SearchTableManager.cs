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

        public Dictionary<int, List<int>> GetSearchResultEntries(string searchTerm)
        {
            var metadata = GetSearchResultsMetadata(searchTerm);
            long maxPage = metadata == null? 0 : metadata.totalResults / SearchResult.MAX_RESULTS_PER_ROW;

            var pages = Enumerable.Range(0, (int)(maxPage + 1)).ToList();
            var results = GetSearchResultEntries(searchTerm, pages);
            return results;
        }
        private Dictionary<int, List<int>> GetSearchResultEntries(string searchTerm, List<int> pageNumbers)
        {
            // build odata query
            var partitionKeyQueries = pageNumbers.Select(p => $"PartitionKey eq '{searchTerm}{p.ToString()}'").ToList();
            string odataQuery = string.Join(" or ", partitionKeyQueries);
            return GetSearchResultEntriesFromQuery(odataQuery);
        }
        // private List<SearchResultEntry> GetSearchResultEntries(string searchTerm, int pageNumber)
        // {
        //     return GetSearchResultEntriesFromQuery($"PartitionKey eq '{searchTerm}{pageNumber.ToString()}'");
        // }
        private Dictionary<int, List<int>> GetSearchResultEntriesFromQuery(string queryFilter)
        {
            Pageable<TableEntity> query = searchTableClient.Query<TableEntity>(filter: queryFilter);

            var results = new SearchResult();
            foreach (TableEntity entity in query)
            {
                var entriesBinary = entity.GetBinary("Entries");
                var entries = DeserializeFromByteArray<Dictionary<int, List<int>>>(entriesBinary);
                results.ExtendFast(entries);
            }
            return results.entries;
        }

        private Dictionary<int, List<int>> GetSearchResultEntriesToAdd(string searchTerm, Dictionary<int, List<int>> entries)
        {
            // get existing article ids
            var existingEntries = GetSearchResultEntries(searchTerm);

            // if no existing entry, just return all entries to add
            if(existingEntries == null)
                return entries;

            // get entries that don't already exist
            var entriesToAdd = new Dictionary<int, List<int>>();
            foreach(var entry in entries) {
                var articleId = entry.Key;
                var startPositions = entry.Value;

                if(existingEntries.ContainsKey(articleId)) {
                    var newStartPositions = startPositions.Where(p => existingEntries[articleId].All(x => x != p)).ToList();
                    if(newStartPositions.Count > 0) {
                        entriesToAdd[articleId] = newStartPositions;
                    }
                }
                else {
                    entriesToAdd[articleId] = startPositions;
                }
            }

            // and return
            return entriesToAdd;
        }

        private Dictionary<int, List<int>> GetSearchResultEntriesToAdd(string searchTerm, List<SearchResultEntry> entries)
        {
            var formattedEntries = new Dictionary<int, List<int>>();
            foreach(var e in entries) {
                if(!formattedEntries.ContainsKey(e.articleId)) {
                    formattedEntries[e.articleId] = new List<int>();
                }
                formattedEntries[e.articleId].Add(e.startPosition);
            }
            return GetSearchResultEntriesToAdd(searchTerm, formattedEntries);
        }


        public List<SearchResultMetadata> GetSearchResultsMetadata(List<string> searchTerms)
        {
            // build odata query
            var partitionKeyQueries = searchTerms.Select(s => $"PartitionKey eq '{s}'").ToList();
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


        public SearchResultMetadata GetSearchResultsMetadata(string searchTerm)
        {
            // build odata query
            string odataQuery = $"PartitionKey eq '{searchTerm}'";

            // fetch query results from table
            var query = searchMetadataTableClient.Query<TableEntity>(filter: odataQuery).ToList();
            var metadata = new SearchResultMetadata();

            // parse to list
            if(query == null || query.Count == 0) {
                return null;
            }

            var result = query[0];
            return new SearchResultMetadata() {
                searchTerm = result.GetString("SearchTerm"),
                totalResults = result.GetInt64("TotalResults").Value
            };
        }





        /* =========================================================== */
        /* ====   Insert Methods   =================================== */
        /* =========================================================== */

        public SearchResult InsertSearchResult(string searchTerm, List<SearchResultEntry> entries, SearchResultMetadata metadata)
        {
            // get entries we haven't already stored
            var entriesToAdd = GetSearchResultEntriesToAdd(searchTerm, entries);

            // if no entries to add, just return
            if(entriesToAdd.Count == 0)
                return new SearchResult() { searchTerm = searchTerm, entries = entriesToAdd };

            // build partition keys
            int poolIndex = (int)(metadata.totalResults / (long)SearchResult.MAX_RESULTS_PER_ROW);
            var partitionKey = $"{searchTerm}{poolIndex}";
            var rowKey = $"{searchTerm}{poolIndex}";

            // check if entity exists
            var existingEntity = GetSearchTermEntity(partitionKey, rowKey);

            // if it exists, update it
            TableEntity tableEntity;
            if(existingEntity.HasValue) {
                var existingEntriesBinary = existingEntity.Value.GetBinary("Entries");
                var existing = new SearchResult() {
                    entries = DeserializeFromByteArray<Dictionary<int, List<int>>>(existingEntriesBinary) 
                };
                var entriesToAddHelper = new SearchResultEntries(entriesToAdd);

                if(existing.Count() + entriesToAddHelper.Count() > SearchResult.MAX_RESULTS_PER_ROW) {
                    int skip = 0; 
                    int take = SearchResult.MAX_RESULTS_PER_ROW - existing.entries.Count;
                    while(skip < entriesToAddHelper.Count()) {
                        // add to existing
                        existing.Extend(entriesToAddHelper.GetEntries(skip, take));
                        // update table entity
                        var entriesByteArray = SerializeToByteArray<Dictionary<int, List<int>>>(existing.entries);
                        tableEntity = new TableEntity(partitionKey, rowKey) {
                            { "SearchTerm", searchTerm },
                            { "Entries", entriesByteArray }
                        };
                        UpsertTableEntity(tableEntity);
                        
                        skip += take;
                        take = SearchResult.MAX_RESULTS_PER_ROW;
                        poolIndex++;
                        partitionKey = $"{searchTerm}{poolIndex}";
                        rowKey = $"{searchTerm}{poolIndex}";
                        existing = new SearchResult();
                    }
                }
                else {
                    existing.Extend(entriesToAdd);

                    // update table entity
                    var entriesByteArray = SerializeToByteArray<Dictionary<int, List<int>>>(existing.entries);
                    tableEntity = new TableEntity(partitionKey, rowKey) {
                        { "SearchTerm", searchTerm },
                        { "Entries", entriesByteArray }
                    };
                }
                
            }
            // otherwise, create a new entry
            else {
                // serialize list properties
                var entriesByteArray = SerializeToByteArray<Dictionary<int, List<int>>>(entriesToAdd);
                tableEntity = new TableEntity(partitionKey, rowKey) {
                    { "SearchTerm", searchTerm },
                    { "Entries", entriesByteArray }
                };
            }
            UpsertTableEntity(tableEntity);

            // update metadata
            var updatedMetadata = new TableEntity(searchTerm, searchTerm) {
                { "TotalResults", metadata.totalResults + entriesToAdd.Count }
            };
            UpsertMetadataEntity(updatedMetadata);

            // return entries we created
            return new SearchResult() {
                searchTerm = searchTerm,
                entries = entriesToAdd
            };
        }


        // public void InsertSearchResults(List<SearchResult> searchResults)
        // {
        //     foreach(var searchResult in searchResults) {
        //         InsertSearchResult(searchResult);
        //     }
        // }

        public SearchResult InsertSearchResult(string searchTerm, List<SearchResultEntry> entries)
        {
            var metadata = GetSearchResultsMetadata(new List<string>() { searchTerm });
            return InsertSearchResult(searchTerm, entries, metadata[0]);
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