using System.Collections.Generic;

using VideoGameArchive.Entities;

namespace VideoGameArchive.Requests
{
    public class GetDatesByFilterRequest
    {
        public required ArticleFilter include { get; set; }
        public required ArticleFilter exclude { get; set; }

        public bool IsValid()
        {
            return include != null && exclude != null;
        }
    }
}