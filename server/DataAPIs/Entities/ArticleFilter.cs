using System.Collections.Generic;

using VideoGameArchive.Data.DB;


namespace VideoGameArchive.Entities
{
    public class ArticleFilter
    {
        public ArticleFilter() { }

        public List<int> websites { get; set; }
        public List<int> authors { get; set; }
        public List<int> articleTypes { get; set; }

        private const string WEBSITE_PARAM_NAME_PREFIX = "w";
        private const string AUTHOR_PARAM_NAME_PREFIX = "a";
        private const string ARTICLE_TYPE_PARAM_NAME_PREFIX = "at";


        // -------------------- public functions ---------------------------------- //
        // ------------------------------------------------------------------------ //
        public bool IsEmpty()
        {
            return websites.Count == 0 && authors.Count == 0 && articleTypes.Count == 0;
        }


        public string GetWebsiteParameterList()
        {
            return GetParameterList(websites, WEBSITE_PARAM_NAME_PREFIX);
        }
        public string GetAuthorParameterList()
        {
            return GetParameterList(authors, AUTHOR_PARAM_NAME_PREFIX);
        }
        public string GetArticleTypeParameterList()
        {
            return GetParameterList(articleTypes, ARTICLE_TYPE_PARAM_NAME_PREFIX);
        }

        public List<PostgresParameter<int>> GetAllParameters()
        {
            var parameters = GetParameters(websites, WEBSITE_PARAM_NAME_PREFIX);
            parameters.AddRange(GetParameters(authors, AUTHOR_PARAM_NAME_PREFIX));
            parameters.AddRange(GetParameters(articleTypes, ARTICLE_TYPE_PARAM_NAME_PREFIX));

            return parameters;
        }


        public string GetWebsitesClause(bool include)
        {
            if(websites.Count == 0)
                return "";

            string inClause = include ? "IN" : "NOT IN";
            return $@"""WebsiteId"" {inClause} ({GetWebsiteParameterList()})";
        }
        public string GetAuthorsClause(bool include)
        {
            if(authors.Count == 0)
                return "";

            string inClause = include ? "IN" : "NOT IN";
            return $@"""AuthorId"" {inClause} ({GetAuthorParameterList()})";
        }
        public string GetArticleTypesClause(bool include)
        {
            if(articleTypes.Count == 0)
                return "";

            string inClause = include ? "IN" : "NOT IN";
            return $@"""ArticleTypeId"" {inClause} ({GetArticleTypeParameterList()})";
        }

        public string GetFullWhereClause(bool include)
        {
            if (IsEmpty())
                return "";

            List<string> clauses = new List<string>();
            clauses.Add(GetWebsitesClause(include));
            clauses.Add(GetAuthorsClause(include));
            clauses.Add(GetArticleTypesClause(include));

            var result = new List<string>();
            foreach (var clause in clauses)
            {
                if (clause != "")
                {
                    result.Add(clause);
                }
            }

            return string.Join(" AND ", result);
        }




        // -------------------- helper functions ---------------------------------- //
        // ------------------------------------------------------------------------ //

        private List<PostgresParameter<int>> GetParameters(List<int> list, string paramNamePrefix)
        {
            var parameters = new List<PostgresParameter<int>>();
            for (int i = 0; i < list.Count; i++)
            {
                parameters.Add(new PostgresParameter<int>()
                {
                    name = $"{paramNamePrefix}{i}",
                    value = list[i]
                });
            }
            return parameters;
        }


        private string GetParameterList(List<int> list, string paramNamePrefix)
        {
            var parameters = new List<string>();
            for (int i = 0; i < list.Count; i++)
            {
                parameters.Add($"@{paramNamePrefix}{i}");
            }
            return string.Join(",", parameters);
        }
    }
}