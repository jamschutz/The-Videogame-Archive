using System;
using System.Linq;
using System.Collections.Generic;

using Npgsql;

using VideoGameArchive.Entities;
using VideoGameArchive.Core;


namespace VideoGameArchive.Data.DB
{
    public class DbManager
    {
        public static string LastSqlQuery;
        private string connectionString;

        public DbManager()
        {
            connectionString = String.Format(
                "Server={0};Username={1};Database={2};Port={3};Password={4};SSLMode=Prefer",
                Secrets.PostgresHost,
                Secrets.PostgresUser,
                Secrets.PostgresDbName,
                Secrets.PostgresPort,
                Secrets.PostgresPassword
            );
        }


        /* =========================================================== */
        /* ====   Main Methods   ===================================== */
        /* =========================================================== */


        public List<T> GetQuery<T>(string query, Func<NpgsqlDataReader, T> parseRow)
        {
            DbManager.LastSqlQuery = query;

            var results = new List<T>();
            using(var connection = new NpgsqlConnection(connectionString)) {
                connection.Open();

                using(var command = new NpgsqlCommand(query, connection)) 
                {
                    var reader = command.ExecuteReader();
                    while(reader.Read())
                    {
                        results.Add(parseRow(reader));
                    }
                    reader.Close();
                }
            }
            return results;



            // var results = new List<T>();
            // using (SqlConnection connection = new SqlConnection(connectionString))
            // {                
            //     connection.Open();
            //     using (SqlCommand command = new SqlCommand(query, connection))
            //     {
            //         using (SqlDataReader reader = command.ExecuteReader())
            //         {
            //             while (reader.Read())
            //             {
            //                 // add each row to results
            //                 results.Add(parseRow(reader));
            //             }
            //         }
            //     }
            // }
            // return results;
        }


        // private void RunQuery(string query)
        // {
        //     DbManager.LastSqlQuery = query;
        //     using (SqlConnection connection = new SqlConnection(connectionString))
        //     {                
        //         connection.Open();
        //         using (SqlCommand command = new SqlCommand(query, connection))
        //         {
        //             command.ExecuteReader();
        //         }
        //     }
        // }
    }


    
}