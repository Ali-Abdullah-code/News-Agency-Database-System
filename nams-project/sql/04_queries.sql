SELECT A.ArtID, A.Title, E.EmpName AS Journalist, A.SecName, A.PubDate
FROM ARTICLE A
INNER JOIN JOURNALIST J ON A.JournalistID = J.EmpID
INNER JOIN EMPLOYEE   E ON J.EmpID        = E.EmpID
WHERE A.Status = 'Published'
ORDER BY A.PubDate DESC;

SELECT A.ArtID, A.Title, E.EmpName AS Editor, A.Status
FROM ARTICLE A
LEFT JOIN EDITOR   ED ON A.EditorID = ED.EmpID
LEFT JOIN EMPLOYEE E  ON ED.EmpID   = E.EmpID;

SELECT E1.EmpName AS Journalist_Name, J.SpecialtyArea,
       E2.EmpName AS Editor_Name,     ED.SeniorityLevel
FROM JOURNALIST J
FULL OUTER JOIN EMPLOYEE E1 ON J.EmpID  = E1.EmpID
FULL OUTER JOIN EDITOR   ED ON ED.EmpID = E1.EmpID
FULL OUTER JOIN EMPLOYEE E2 ON ED.EmpID = E2.EmpID;

SELECT A.Title,
       EJ.EmpName AS WrittenBy,
       EE.EmpName AS ReviewedBy,
       A.SecName,
       A.Status
FROM ARTICLE A
JOIN JOURNALIST J  ON A.JournalistID = J.EmpID
JOIN EMPLOYEE  EJ  ON J.EmpID        = EJ.EmpID
JOIN EDITOR    ED  ON A.EditorID     = ED.EmpID
JOIN EMPLOYEE  EE  ON ED.EmpID       = EE.EmpID;

SELECT E.Email, 'Journalist' AS Role
FROM EMPLOYEE E INNER JOIN JOURNALIST J ON E.EmpID = J.EmpID
UNION
SELECT E.Email, 'Editor' AS Role
FROM EMPLOYEE E INNER JOIN EDITOR ED ON E.EmpID = ED.EmpID;

SELECT SubID FROM COMMENT_T WHERE ArtID IN
    (SELECT ArtID FROM ARTICLE WHERE SecName = 'Politics')
INTERSECT
SELECT SubID FROM COMMENT_T WHERE ArtID IN
    (SELECT ArtID FROM ARTICLE WHERE SecName = 'Technology');

SELECT EmpID FROM JOURNALIST
MINUS
SELECT JournalistID FROM ARTICLE;

SELECT Title, Status, PubDate
FROM ARTICLE
WHERE JournalistID IN (
    SELECT EmpID FROM JOURNALIST WHERE SpecialtyArea = 'Technology'
);

SELECT A.ArtID, A.Title
FROM ARTICLE A
WHERE (
    SELECT COUNT(*) FROM COMMENT_T C WHERE C.ArtID = A.ArtID
) > 1;

SELECT ArtID, Title
FROM ARTICLE
WHERE ArtID = (
    SELECT ArtID FROM (
        SELECT ArtID
        FROM REVISION
        GROUP BY ArtID
        ORDER BY COUNT(*) DESC
    )
    WHERE ROWNUM <= 1
);

SELECT SubID, Username, MembershipType
FROM SUBSCRIBER S
WHERE EXISTS (
    SELECT 1 FROM COMMENT_T C WHERE C.SubID = S.SubID
);

-- Index on ARTICLE.Status (frequently filtered)
CREATE INDEX idx_article_status    ON ARTICLE(Status);

-- Index on ARTICLE.SecName (frequently joined)
CREATE INDEX idx_article_section   ON ARTICLE(SecName);

-- Index on ARTICLE.JournalistID (frequently joined)
CREATE INDEX idx_article_journalist ON ARTICLE(JournalistID);

-- Index on COMMENT_T.ArtID
CREATE INDEX idx_comment_artid     ON COMMENT_T(ArtID);

-- Index on REVISION.ArtID
CREATE INDEX idx_revision_artid    ON REVISION(ArtID);

-- Index on SUBSCRIBER.MembershipType
CREATE INDEX idx_sub_membership    ON SUBSCRIBER(MembershipType);

CREATE OR REPLACE VIEW vw_published_articles AS
SELECT A.ArtID, A.Title, E.EmpName AS Journalist,
       A.SecName, A.PubDate
FROM ARTICLE A
JOIN JOURNALIST J ON A.JournalistID = J.EmpID
JOIN EMPLOYEE   E ON J.EmpID        = E.EmpID
WHERE A.Status = 'Published';

-- Usage:
SELECT * FROM vw_published_articles ORDER BY PubDate DESC;

CREATE OR REPLACE VIEW vw_article_comments AS
SELECT A.ArtID, A.Title, COUNT(C.CommID) AS TotalComments
FROM ARTICLE A
LEFT JOIN COMMENT_T C ON A.ArtID = C.ArtID
GROUP BY A.ArtID, A.Title;

-- Usage:
SELECT * FROM vw_article_comments ORDER BY TotalComments DESC;

CREATE OR REPLACE VIEW vw_section_revenue AS
SELECT SecName, COUNT(AdID) AS TotalAds, SUM(Cost) AS TotalRevenue
FROM ADSPACE
GROUP BY SecName;

-- Usage:
SELECT * FROM vw_section_revenue ORDER BY TotalRevenue DESC;

