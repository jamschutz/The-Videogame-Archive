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
        private TableItem searchTable;
        private const string SearchTableName = "searchResults";

        public SearchTableManager()
        {
            searchTableClient = new TableClient(Secrets.SearchTableConnectionString, SearchTableName);
        }


        /* =========================================================== */
        /* ====   Get Methods   ====================================== */
        /* =========================================================== */

        public List<SearchResultEntry> GetSearchResultEntries(string searchTerm)
        {
            Pageable<TableEntity> query = searchTableClient.Query<TableEntity>(filter: $"PartitionKey eq '{searchTerm}'");
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





        /* =========================================================== */
        /* ====   Insert Methods   =================================== */
        /* =========================================================== */

        public List<SearchResultEntry> InsertSearchResult(SearchResult searchResult)
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

                Console.WriteLine($"creating entry with articleid: {entry.articleId}, and pos: {entry.startPosition}");
            }

            // build partition keys
            var partitionKey = searchResult.searchTerm;
            var rowKey = searchResult.searchTerm;

            // serialize list properties
            string articleIdsStr = string.Join(',', articleIds);
            string startPositionsStr = string.Join(',', startPositions);

            // check if entity exists
            var existingEntity = GetSearchTermEntity(searchResult.searchTerm);

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

            // return entries we created
            return entriesToAdd;
        }


        public void InsertSearchResults(List<SearchResult> searchResults)
        {
            foreach(var searchResult in searchResults) {
                InsertSearchResult(searchResult);
            }
        }





        /* =========================================================== */
        /* ====   Main Methods   ===================================== */
        /* =========================================================== */

        private void UpsertTableEntity(TableEntity entity)
        {
            searchTableClient.UpsertEntity(entity);
        }

        private NullableResponse<TableEntity> GetSearchTermEntity(string searchTerm)
        {
            return searchTableClient.GetEntityIfExists<TableEntity>(searchTerm, searchTerm, null, new CancellationToken());
        }

    }
    
}