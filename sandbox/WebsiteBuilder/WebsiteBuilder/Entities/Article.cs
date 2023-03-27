using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebsiteBuilder.Entities
{
    class Article
    {
        public string title;
        public string subtitle;
        public string author;
        public string url;
        public string website;
        public string thumbnail;
        public int datePublished;

        public string ToString()
        {
            return $"title: {title} \nsubtitle: {subtitle} \nauthor: {author} \nurl: {url} \nwebsite: {website} \nthumbnail: {thumbnail} \ndate: {datePublished}";
        }
    }
}
