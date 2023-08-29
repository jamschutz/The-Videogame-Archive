namespace VideoGameArchive.Entities
{
    public class Article
    {
        public Article() {}

        public string title { get; set; }
        public string subtitle { get; set; }
        public string url { get; set; }
        public string author { get; set; }
        public string website { get; set; }
        public int datePublished { get; set; }
        public string thumbnail { get; set; }
        public string articleType { get; set; }
        public bool isArchivied { get; set; }
    }
}