CREATE VIEW 
	vArticle
WITH SCHEMABINDING
AS
	SELECT                      
		dbo.Article.Id, dbo.Article.Title, dbo.Article.Subtitle, dbo.Article.DatePublished, dbo.Thumbnail.Filename AS Thumbnail, 
		dbo.Publication.Name AS Website, dbo.ArticleUrl.Url, dbo.ArticleType.Name AS Type, dbo.Writer.Name AS Author
	FROM                         
		dbo.Article 
	INNER JOIN
		dbo.ArticleType 
	ON 
		dbo.Article.ArticleTypeId = dbo.ArticleType.Id 
	INNER JOIN
		dbo.ArticleUrl 
	ON 
		dbo.Article.UrlId = dbo.ArticleUrl.Id 
	INNER JOIN
		dbo.Publication 
	ON 
		dbo.Article.WebsiteId = dbo.Publication.Id 
	INNER JOIN
		dbo.Thumbnail 
	ON 
		dbo.Article.Id = dbo.Thumbnail.ArticleId 
	INNER JOIN
		dbo.Writer 
	ON 
		dbo.Article.AuthorId = dbo.Writer.Id
GO


CREATE UNIQUE CLUSTERED INDEX
    IX_vArticle_id
ON
    dbo.vArticle(Id)


CREATE NONCLUSTERED INDEX
    IX_vArticle_Title
ON
    dbo.vArticle(Title)

CREATE NONCLUSTERED INDEX
    IX_vArticle_Subtitle
ON
    dbo.vArticle(Subtitle)