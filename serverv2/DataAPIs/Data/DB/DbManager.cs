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


        public List<T> GetQuery<T, P>(string query, List<PostgresParameter<P>> parameters, Func<NpgsqlDataReader, T> parseRow)
        {
            DbManager.LastSqlQuery = query;

            var results = new List<T>();
            using(var connection = new NpgsqlConnection(connectionString)) {
                connection.Open();

                using(var command = new NpgsqlCommand(query, connection)) 
                {
                    // add parameters
                    foreach(var parameter in parameters) {
                        command.Parameters.AddWithValue(parameter.name, parameter.value);
                    }

                    // read line by line
                    var reader = command.ExecuteReader();
                    while(reader.Read())
                    {
                        results.Add(parseRow(reader));
                    }
                    reader.Close();
                }
            }
            return results;
        }


        public List<T> GetQuery<T>(string query, Func<NpgsqlDataReader, T> parseRow)
        {
            var parameters = new List<PostgresParameter<bool>>();
            return GetQuery<T, bool>(query, parameters, parseRow);
        }


        public void RunQuery<T>(string query, List<PostgresParameter<T>> parameters)
        {
            DbManager.LastSqlQuery = query;

            using(var connection = new NpgsqlConnection(connectionString)) {
                connection.Open();

                using(var command = new NpgsqlCommand(query, connection)) 
                {
                    // add parameters
                    foreach(var parameter in parameters) {
                        command.Parameters.AddWithValue(parameter.name, parameter.value);
                    }

                    // and run
                    command.ExecuteNonQuery();
                }
            }
        }

        public void RunQuery(string query)
        {
            var parameters = new List<PostgresParameter<bool>>();
            RunQuery(query, parameters);
        }
    }


    
}