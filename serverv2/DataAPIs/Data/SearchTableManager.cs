using System;
using System.Linq;
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

        public List<int> GetArticleIds(string searchTerm)
        {
            Pageable<TableEntity> query = searchTableClient.Query<TableEntity>(filter: $"PartitionKey eq '{searchTerm}'");
            var results = new List<int>();

            foreach (TableEntity entity in query)
            {
                var articleIds = entity.GetString("ArticleIds");
                results.AddRange(articleIds.Split(',').Select(a => int.Parse(a)));
            }
             
            return results;
        }





        /* =========================================================== */
        /* ====   Insert Methods   =================================== */
        /* =========================================================== */


        public void InsertSearchResults(List<SearchResult> searchResults)
        {
            foreach(var searchResult in searchResults) {
                // build partition keys
                var partitionKey = searchResult.searchTerm;
                var rowKey = searchResult.searchTerm;

                // serialize list properties
                string articleIds = string.Join(',', searchResult.articleIds);
                string startPositions = string.Join(',', searchResult.startPositions);

                // create table entity
                var tableEntity = new TableEntity(partitionKey, rowKey)
                {
                    { "ArticleIds", articleIds },
                    { "StartPositions", startPositions }
                };
                InsertTableEntity(tableEntity);
            }
            
        }





        /* =========================================================== */
        /* ====   Main Methods   ===================================== */
        /* =========================================================== */

        private void InsertTableEntity(TableEntity entity)
        {
            searchTableClient.AddEntity(entity);
        }

    }
    
}