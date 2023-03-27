using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using WebsiteBuilder.Entities;

namespace WebsiteBuilder.UI
{
    class WebsiteColumn
    {
        private string websiteName;
        private Article[] articles;

        public WebsiteColumn(string websiteName, Article[] articles)
        {
            this.websiteName = websiteName;
            this.articles = articles;
        }
    }
}
