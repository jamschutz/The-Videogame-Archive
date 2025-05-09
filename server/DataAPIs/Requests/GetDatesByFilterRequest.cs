using System.Collections.Generic;

using VideoGameArchive.Entities;

namespace VideoGameArchive.Requests
{
    public class GetDatesByFilterRequest
    {
        public ArticleFilter include { get; set; }
        public ArticleFilter exclude { get; set; }

        public bool IsValid()
        {
            return include != null && exclude != null;
        }
    }
}