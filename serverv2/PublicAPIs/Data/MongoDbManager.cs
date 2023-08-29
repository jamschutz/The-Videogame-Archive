using System;
using System.Collections.Generic;

using VideoGameArchive.Core;
using VideoGameArchive.Entities;

using MongoDB.Driver;
using MongoDB.Bson;

namespace VideoGameArchive.Data
{
    public class MongoDbManager
    {
        private IMongoClient client;

        private const string DatabaseName = "VideogameArchive";
        private const string CollectionName = "SearchResults";

        private IMongoCollection<SearchTermResults> searchResults;

        public MongoDbManager()
        {
            try
            {
                client = new MongoClient(Secrets.MongoConnectionString);
                searchResults = client.GetDatabase(DatabaseName).GetCollection<SearchTermResults>(CollectionName);
            }
            catch (Exception e)
            {
                Console.WriteLine("There was a problem connecting to your " +
                    "Atlas cluster. Check that the URI includes a valid " +
                    "username and password, and that your IP address is " +
                    $"in the Access List. Message: {e.Message}");
                Console.WriteLine(e);
                Console.WriteLine();
                return;
            }

            var test1 = new SearchTermResults() {
                searchTerm = "mario",
                results = new List<SearchResult>() {
                    new SearchResult { articleId = 1, startPos = 5 },
                    new SearchResult { articleId = 1, startPos = 15 },
                    new SearchResult { articleId = 12, startPos = 33 },
                    new SearchResult { articleId = 13, startPos = 1 },
                    new SearchResult { articleId = 44, startPos = 113 },
                }
            };
            var test2 = new SearchTermResults() {
                searchTerm = "luigi",
                results = new List<SearchResult>() {
                    new SearchResult { articleId = 2, startPos = 75 },
                    new SearchResult { articleId = 2, startPos = 188 },
                }
            };
            InsertSearchResults(new List<SearchTermResults>() { test1, test2 });
        }


        public void InsertSearchResults(List<SearchTermResults> newSearchResults)
        {            
            try {
                searchResults.InsertMany(newSearchResults);
            }
            catch (Exception e) {
                Console.WriteLine($"Something went wrong trying to insert the new documents." +
                    $" Message: {e.Message}");
                Console.WriteLine(e);
                Console.WriteLine();
                return;
            }
        }
    }
}