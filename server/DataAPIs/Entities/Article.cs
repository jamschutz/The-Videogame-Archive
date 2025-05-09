namespace VideoGameArchive.Entities
{
    public class Article
    {
        public Article() {}

        public int? id { get; set; }
        public required string title { get; set; }
        public required string subtitle { get; set; }
        public required string url { get; set; }
        public required string author { get; set; }
        public required string website { get; set; }
        public int datePublished { get; set; }
        public required string thumbnail { get; set; }
        public required string articleType { get; set; }
        public bool isArchivied { get; set; }
    }
}