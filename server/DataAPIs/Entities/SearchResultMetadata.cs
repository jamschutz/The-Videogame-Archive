using System;
using System.Collections.Generic;

using VideoGameArchive.Core;

namespace VideoGameArchive.Entities
{
    public class SearchResultMetadata
    {
        public const string PARTITION_KEY = "__metadata";
        public string searchTerm { get; set; }
        public long totalResults { get; set; }
    }
}