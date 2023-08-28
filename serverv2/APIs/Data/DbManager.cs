using System.Collections.Generic;

using Microsoft.Data.SqlClient;

// using VideoGameArchive.Entities;
// using VideoGameArchive.Core;


namespace VGA.Data
{
    public class DbManager
    {
        string connectionString;
        public DbManager()
        {
            var builder = new SqlConnectionStringBuilder();

            builder.DataSource = Secrets.SqlServerName;
            builder.UserID = Secrets.SqlServerAdminUser;
            builder.Password = Secrets.SqlServerAdminPasword;
            builder.InitialCatalog = Secrets.SqlDbName;

            connectionString = builder.ConnectionString;
        }
    }
}