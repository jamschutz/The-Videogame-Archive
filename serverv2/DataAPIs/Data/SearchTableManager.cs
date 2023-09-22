using System;
using System.Linq;
using System.Threading;
using System.Collections.Generic;

using Azure;
using Azure.Data.Tables;
using Azure.Data.Tables.Models;

using VideoGameArchive.Entities;
using VideoGameArchive.Core;


namespace VideoGameArchive.Data
{
    public class SearchTableManager
    {
        private TableClient searchTableClient;
        private TableClient searchMetadataTableClient;
        private const string SearchTableName = "searchResults";
        private const string SearchMetadataTableName = "searchResultsMetadata";

        public SearchTableManager()
        {
            searchTableClient = new TableClient(Secrets.SearchTableConnectionString, SearchTableName);
            searchMetadataTableClient = new TableClient(Secrets.SearchTableConnectionString, SearchMetadataTableName);
        }

        // public void DeleteAllEntities()
        // {
        //     // Only the PartitionKey & RowKey fields are required for deletion
        //     Pageable<TableEntity> entities = searchTableClient
        //         .Query<TableEntity>(select: new List<string>() { "PartitionKey", "RowKey" }, maxPerPage: 1000);

        //     entities.AsPages().ToList().ForEach(page => {
        //         // Since we don't know how many rows the table has and the results are ordered by PartitonKey+RowKey
        //         // we'll delete each page immediately and not cache the whole table in memory
        //         BatchManipulateEntities(searchTableClient, page.Values, TableTransactionActionType.Delete);
        //     });
        // }

        // public static List<Response<IReadOnlyList<Response>>> BatchManipulateEntities<T>(TableClient tableClient, IEnumerable<T> entities, TableTransactionActionType tableTransactionActionType) where T : class, ITableEntity, new()
        // {
        //     var groups = entities.GroupBy(x => x.PartitionKey);
        //     var responses = new List<Response<IReadOnlyList<Response>>>();
        //     foreach (var group in groups)
        //     {
        //         List<TableTransactionAction> actions;
        //         var items = group.AsEnumerable();
        //         while (items.Any())
        //         {
        //             var batch = items.Take(100);
        //             items = items.Skip(100);

        //             actions = new List<TableTransactionAction>();
        //             actions.AddRange(batch.Select(e => new TableTransactionAction(tableTransactionActionType, e)));
        //             var response = tableClient.SubmitTransaction(actions);
        //             responses.Add(response);
        //         }
        //     }
        //     return responses;
        // }


        /* =========================================================== */
        /* ====   Get Methods   ====================================== */
        /* =========================================================== */

        public List<SearchResultEntry> GetSearchResultEntries(string searchTerm)
        {
            var metadata = GetSearchResultsMetadata(searchTerm);
            long maxPage = metadata.totalResults / SearchResult.MAX_RESULTS_PER_ROW;

            var pages = Enumerable.Range(0, (int)(maxPage + 1)).ToList();
            var results = GetSearchResultEntries(searchTerm, pages);
            // var results = new List<SearchResultEntry>();
            // for(int page = 0; page <= maxPage; page++) {
            //     results.AddRange(GetSearchResultEntries(searchTerm, page));
            // }
            return results;
        }

        private List<SearchResultEntry> GetSearchResultEntries(string searchTerm, List<int> pageNumbers)
        {
            // build odata query
            var partitionKeyQueries = pageNumbers.Select(p => $"PartitionKey eq '{searchTerm}{p.ToString()}'").ToList();
            string odataQuery = string.Join(" or ", partitionKeyQueries);

            Pageable<TableEntity> query = searchTableClient.Query<TableEntity>(filter: odataQuery);
            var articleIds = new List<int>();
            var startPositions = new List<int>();

            foreach (TableEntity entity in query)
            {
                var ids = entity.GetString("ArticleIds");
                var positions = entity.GetString("StartPositions");
                articleIds.AddRange(ids.Split(',').Select(id => int.Parse(id)));
                startPositions.AddRange(positions.Split(',').Select(pos => int.Parse(pos)));
            }

            var results = new List<SearchResultEntry>();
            for(int i = 0; i < articleIds.Count; i++) {
                results.Add(new SearchResultEntry() {
                    articleId = articleIds[i],
                    startPosition = startPositions[i]
                });
            }
            return results;
        }

        private List<SearchResultEntry> GetSearchResultEntries(string searchTerm, int pageNumber)
        {
            Pageable<TableEntity> query = searchTableClient.Query<TableEntity>(filter: $"PartitionKey eq '{searchTerm}{pageNumber.ToString()}'");
            var articleIds = new List<int>();
            var startPositions = new List<int>();

            foreach (TableEntity entity in query)
            {
                var ids = entity.GetString("ArticleIds");
                var positions = entity.GetString("StartPositions");
                articleIds.AddRange(ids.Split(',').Select(id => int.Parse(id)));
                startPositions.AddRange(positions.Split(',').Select(pos => int.Parse(pos)));
            }

            var results = new List<SearchResultEntry>();
            for(int i = 0; i < articleIds.Count; i++) {
                results.Add(new SearchResultEntry() {
                    articleId = articleIds[i],
                    startPosition = startPositions[i]
                });
            }
            return results;
        }

        private List<SearchResultEntry> GetSearchResultEntriesToAdd(SearchResult searchResult)
        {
            // get existing article ids
            var existingEntries = GetSearchResultEntries(searchResult.searchTerm);

            // get hashset for entries
            var existingEntryLookup = new HashSet<long>();
            existingEntries.ForEach(entry => 
                existingEntryLookup.Add(entry.GetHash())
            );

            // get entries that don't already exist
            var entriesToAdd = new List<SearchResultEntry>();
            for(int i = 0; i < searchResult.articleIds.Count; i++) {
                var entry = new SearchResultEntry() {
                    articleId = searchResult.articleIds[i],
                    startPosition = searchResult.startPositions[i]
                };

                // if we've already seen it...
                if(existingEntryLookup.Contains(entry.GetHash())) {
                    // ignore...
                }
                // otherwise, mark to add
                else {
                    entriesToAdd.Add(entry);
                }
            }

            return entriesToAdd;
        }


        public List<SearchResultMetadata> GetSearchResultsMetadata(List<SearchResult> searchResults)
        {
            // build odata query
            var partitionKeyQueries = searchResults.Select(r => $"PartitionKey eq '{r.searchTerm}'").ToList();
            string odataQuery = string.Join(" or ", partitionKeyQueries);

            // fetch query results from table
            Pageable<TableEntity> query = searchMetadataTableClient.Query<TableEntity>(filter: odataQuery);
            var metadata = new List<SearchResultMetadata>();

            // parse to list
            foreach (TableEntity entity in query)
            {
                string searchTerm = entity.GetString("SearchTerm");
                long? totalResults = entity.GetInt64("TotalResults");
                if(totalResults.HasValue)
                    metadata.Add(new SearchResultMetadata() { 
                        searchTerm = searchTerm,
                        totalResults = totalResults.Value 
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

        public List<SearchResultEntry> InsertSearchResult(SearchResult searchResult, SearchResultMetadata metadata)
        {
            // get entries we haven't already stored
            var entriesToAdd = GetSearchResultEntriesToAdd(searchResult);

            // if no entries to add, just return
            if(entriesToAdd.Count == 0)
                return entriesToAdd;

            // build separate article id and startposition lists (making sure they line up at equal indices)
            var articleIds = new List<int>();
            var startPositions = new List<int>();
            foreach(var entry in entriesToAdd) {
                articleIds.Add(entry.articleId);
                startPositions.Add(entry.startPosition);
            }

            // build partition keys
            int poolIndex = (int)(metadata.totalResults / (long)SearchResult.MAX_RESULTS_PER_ROW);
            var partitionKey = $"{searchResult.searchTerm}{poolIndex}";
            var rowKey = $"{searchResult.searchTerm}{poolIndex}";

            // serialize list properties
            string articleIdsStr = string.Join(',', articleIds);
            string startPositionsStr = string.Join(',', startPositions);

            // check if entity exists
            var existingEntity = GetSearchTermEntity(partitionKey, rowKey);

            // if it exists, update it
            TableEntity tableEntity;
            if(existingEntity.HasValue) {
                string existingArticleIds = existingEntity.Value.GetString("ArticleIds");
                string existingStartPositions = existingEntity.Value.GetString("StartPositions");

                // update table entity
                tableEntity = new TableEntity(partitionKey, rowKey) {
                    { "ArticleIds", $"{existingArticleIds},{articleIdsStr}" },
                    { "StartPositions", $"{existingStartPositions},{startPositionsStr}" }
                };
            }
            // otherwise, create a new entry
            else {
                tableEntity = new TableEntity(partitionKey, rowKey) {
                    { "ArticleIds", articleIdsStr },
                    { "StartPositions", startPositionsStr }
                };
            }
            UpsertTableEntity(tableEntity);

            // update metadata
            var updatedMetadata = new TableEntity(searchResult.searchTerm, searchResult.searchTerm) {
                { "TotalResults", metadata.totalResults + articleIds.Count }
            };
            UpsertMetadataEntity(updatedMetadata);

            // return entries we created
            return entriesToAdd;
        }


        public void InsertSearchResults(List<SearchResult> searchResults)
        {
            foreach(var searchResult in searchResults) {
                InsertSearchResult(searchResult);
            }
        }

        public List<SearchResultEntry> InsertSearchResult(SearchResult searchResult)
        {
            var list = new List<SearchResult>();
            list.Add(searchResult);
            var metadata = GetSearchResultsMetadata(list)[0];
            return InsertSearchResult(searchResult, metadata);
        }





        /* =========================================================== */
        /* ====   Main Methods   ===================================== */
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

    }
    
}