namespace VideoGameArchive.Data.DB
{
    public class PostgresParameter<T>
    {
        public required string name;
        public required T value;
    }
}