namespace VideoGameArchive.Entities
{
    public class Website
    {
        public Website() {}

        public int id { get; set; }
        public required string name { get; set; }
        public string? founders { get; set; }
        public int yearStarted { get; set; }
        public int? yearEnded { get; set; }
        public required string url { get; set; }
        public required string country { get; set; }
        public bool isActive { get; set; }
        public required string type { get; set; }
        public int? lastWebcrawlDate { get; set; }
    }
}