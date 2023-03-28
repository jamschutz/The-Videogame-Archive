using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using WebsiteBuilder.Entities;

namespace WebsiteBuilder.UI
{
    class PublicationColumn
    {
        private string publicationName;
        private Article[] articles;

        public PublicationColumn(string websiteName, Article[] articles)
        {
            this.publicationName = websiteName;
            this.articles = articles;
        }
    }
}
