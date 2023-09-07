// using System;
// using System.Linq;
// using System.Collections.Generic;

// using VideoGameArchive.Core;
// using VideoGameArchive.Entities;

// using MongoDB.Driver;
// using MongoDB.Bson;

// namespace VideoGameArchive.Data
// {
//     public class MongoDbManager
//     {
//         private IMongoClient client;

//         private const string DatabaseName = "VideogameArchive";
//         private const string CollectionName = "SearchResults";

//         private IMongoCollection<SearchTermResults> searchResults;

//         public MongoDbManager()
//         {
//             try
//             {
//                 client = new MongoClient(Secrets.MongoConnectionString);
//                 searchResults = client.GetDatabase(DatabaseName).GetCollection<SearchTermResults>(CollectionName);
//             }
//             catch (Exception e)
//             {
//                 Console.WriteLine("There was a problem connecting to your " +
//                     "Atlas cluster. Check that the URI includes a valid " +
//                     "username and password, and that your IP address is " +
//                     $"in the Access List. Message: {e.Message}");
//                 Console.WriteLine(e);
//                 Console.WriteLine();
//                 return;
//             }

//             var test1 = new SearchTermResults() {
//                 searchTerm = "mario",
//                 results = new List<SearchResult>() {
//                     new SearchResult { articleId = 1, startPos = 5 },
//                     new SearchResult { articleId = 1, startPos = 15 },
//                     new SearchResult { articleId = 12, startPos = 33 },
//                     new SearchResult { articleId = 13, startPos = 1 },
//                     new SearchResult { articleId = 44, startPos = 113 },
//                 }
//             };
//             var test2 = new SearchTermResults() {
//                 searchTerm = "luigi",
//                 results = new List<SearchResult>() {
//                     new SearchResult { articleId = 2, startPos = 75 },
//                     new SearchResult { articleId = 2, startPos = 188 },
//                 }
//             };
//             InsertSearchResults(test1);
//             InsertSearchResults(test2);
//         }


//         public void InsertSearchResults(SearchTermResults newSearchResults)
//         {            
//             try {
//                 var existingResults = GetSearchResults(newSearchResults.searchTerm);
//                 if(existingResults != null) {
//                     var existingResultsLookup = new HashSet<long>();
//                     foreach(var result in existingResults) {
//                         existingResultsLookup.Add(GetSearchResultHash(result.articleId, result.startPos));
//                     }

//                     var searchResultsToAdd = newSearchResults.results.Where(r => 
//                         !existingResultsLookup.Contains(GetSearchResultHash(r.articleId, r.startPos))
//                     );

//                     searchResults.UpdateOne(
//                         Query.EQ("searchTerm", newSearchResults.searchTerm), 
//                         Update.PushWrapped("results", searchResultsToAdd)
//                     );
//                 }
//                 else {
//                     searchResults.Insert(newSearchResults);
//                 }                
//             }
//             catch (Exception e) {
//                 Console.WriteLine($"Something went wrong trying to insert the new documents." +
//                     $" Message: {e.Message}");
//                 Console.WriteLine(e);
//                 Console.WriteLine();
//                 return;
//             }
//         }


//         public List<SearchResult> GetSearchResults(string searchTerm)
//         {
//             var findFilter = SearchTerm<SearchTermResults>
//                 .Filter.AnyEq(t => t.searchTerm,
//                 searchTerm);
//             return searchResults.Find(findFilter).FirstOrDefault();
//         }


//         // taken from : https://stackoverflow.com/questions/919612/mapping-two-integers-to-one-in-a-unique-and-deterministic-way
//         public long GetSearchResultHash(int a, int b)
//         {
//             var A = (ulong)(a >= 0 ? 2 * (long)a : -2 * (long)a - 1);
//             var B = (ulong)(b >= 0 ? 2 * (long)b : -2 * (long)b - 1);
//             var C = (long)((A >= B ? A * A + A + B : A + B * B) / 2);
//             return a < 0 && b < 0 || a >= 0 && b >= 0 ? C : -C - 1;
//         }
//     }
// }