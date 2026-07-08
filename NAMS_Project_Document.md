# News Agency Management System (NAMS)
### Complete Database Systems Project Documentation

---

> **Course:** Database Systems | **Database:** Oracle 21c | **Session:** 2024–2025

---

## Table of Contents

1. [Introduction & Project Overview](#1-introduction--project-overview)
2. [Software Requirements Specification (SRS)](#2-software-requirements-specification-srs)
3. [EERD and Relational Schema](#3-eerd-and-relational-schema)
4. [DDL — Table Creation (Oracle SQL)](#4-ddl--table-creation-oracle-sql)
5. [DCL — Data Control Language](#5-dcl--data-control-language)
6. [Data Population — INSERT Statements](#6-data-population--insert-statements)
7. [Advanced SQL Queries](#7-advanced-sql-queries)
8. [PL/SQL — Packages, Cursors, Triggers, Object Types](#8-plsql--packages-cursors-triggers-object-types)
9. [Tech Stack & Frontend](#9-tech-stack--frontend)
10. [Technical Constraints & ACID Properties](#10-technical-constraints--acid-properties)
11. [Step-by-Step: How to Run the Project](#11-step-by-step-how-to-run-the-project)
12. [API Endpoints Reference](#12-api-endpoints-reference)
13. [Inputs, Outputs & Features Summary](#13-inputs-outputs--features-summary)
14. [Submission Checklist](#14-submission-checklist)

---

## 1. Introduction & Project Overview

### 1.1 What Is NAMS?

The **News Agency Management System (NAMS)** is a relational database application that models the daily operations of a digital news agency. It tracks every important entity inside a news organization: journalists who write articles, editors who review them, subscribers who read and comment, advertisements, images, revision histories, and the sources cited in articles.

### 1.2 Project Goals

- Design a normalized relational database (up to 3NF/BCNF) using Oracle SQL.
- Implement all DDL (tables, constraints) and DCL (GRANT, REVOKE) commands.
- Populate every table with realistic mock data (minimum 10+ rows each).
- Write beginner-friendly SQL queries covering joins, subqueries, and set operations.
- Build PL/SQL components: packages, cursors, triggers, and object types.
- Create a simple, attractive frontend using HTML, CSS, and JavaScript (Vanilla).

### 1.3 Entities Overview

| Entity | Description |
|---|---|
| **Article** | The core news article with title, content, status, and publish date. |
| **Journalist** | An employee who writes articles; has a specialty area. |
| **Editor** | An employee who reviews and approves articles; has a seniority level. |
| **Section** | A category/department (e.g., Sports, Politics, Tech). |
| **Image** | An image attached to an article (weak entity). |
| **Comment** | A comment posted by a subscriber on an article (weak entity). |
| **Subscriber** | A registered reader who can post comments. |
| **Revision** | A record of every edit made to an article (weak entity). |
| **AdSpace** | An advertisement placed within a section. |
| **Source** | A cited source (e.g., Reuters) referenced in articles. |

---

## 2. Software Requirements Specification (SRS)

### 2.1 Functional Requirements

#### 2.1.1 Article Management
- The system shall allow creation of articles with a title, content, status (Draft/Published/Archived), and publish date.
- Each article must be written by one journalist and reviewed by one editor.
- Each article belongs to exactly one section.
- An article can cite multiple sources (many-to-many).
- An article can have multiple images, revisions, and comments.

#### 2.1.2 Employee Management
- Employees are either Journalists or Editors (ISA/specialization relationship).
- Every employee has a unique EmpID, Name, and Email.
- Journalists have an additional `SpecialtyArea` field.
- Editors have an additional `SeniorityLevel` field (Junior/Senior/Chief).

#### 2.1.3 Subscriber & Comment Management
- Subscribers register with a unique username, email, and membership type (Free/Premium).
- A subscriber can post comments on articles.
- Each comment stores text, timestamp, and links to both article and subscriber.

#### 2.1.4 AdSpace Management
- AdSpaces belong to a Section.
- Each AdSpace has dimensions, placement type (Banner/Sidebar/Footer), and cost per day.

#### 2.1.5 Revision Tracking
- Every time an article is edited, a revision record is created with a revision number, changes made, and timestamp.
- Revision is a weak entity — its identity depends on the Article it belongs to.

### 2.2 Non-Functional Requirements

- All transactions must follow ACID properties.
- Indexes must be created on frequently searched columns for performance.
- The frontend must perform all four CRUD operations (Create, Read, Update, Delete).
- The database must have proper DCL (GRANT/REVOKE) to separate user access.

### 2.3 System Architecture Overview

| Tier | Technology | Purpose |
|---|---|---|
| **Frontend** | HTML5 + CSS3 + Vanilla JS | User interface — forms, tables, search |
| **Backend/API** | Node.js + Express.js | REST API connecting frontend to database |
| **Database** | Oracle 21c (or Oracle XE 21c) | Stores all data; runs SQL & PL/SQL |

---

## 3. EERD and Relational Schema

### 3.1 EERD Description

#### 3.1.1 Supertype and Subtypes (Specialization)

**Employee** is the supertype with two subtypes:
- **Journalist** — adds `SpecialtyArea` attribute.
- **Editor** — adds `SeniorityLevel` attribute.

This is a **DISJOINT** specialization — an employee is either a journalist OR an editor, not both. The ISA triangle connects Employee to both subtypes.

#### 3.1.2 Weak (Identifying) Entities

| Weak Entity | Owner Entity | Identifying Relationship | Partial Key |
|---|---|---|---|
| Revision | Article | Undergoes | RevNo |
| Image | Article | Contains | ImgID |
| Comment | Article | Attached To | CommID |

#### 3.1.3 Relationships Summary

| Relationship | Entity 1 | Cardinality | Entity 2 | Notes |
|---|---|---|---|---|
| Writes | Journalist | 1 : M | Article | One journalist writes many articles |
| Reviews | Editor | 1 : M | Article | One editor reviews many articles |
| Categorized In | Article | M : 1 | Section | Many articles in one section |
| Cites | Article | M : N | Source | Bridge table: ARTICLE_SOURCE |
| Features | Section | 1 : M | AdSpace | One section has many ad spaces |
| Contains | Article | 1 : M | Image | Weak entity — identifying rel. |
| Undergoes | Article | 1 : M | Revision | Weak entity — identifying rel. |
| Attached To | Article | 1 : M | Comment | Weak entity |
| Posts | Subscriber | 1 : M | Comment | One subscriber posts many comments |

### 3.2 Relational Schema (After Normalization to 3NF)

```
EMPLOYEE        (EmpID [PK], EmpName, Email)
JOURNALIST      (EmpID [PK, FK→EMPLOYEE], SpecialtyArea)
EDITOR          (EmpID [PK, FK→EMPLOYEE], SeniorityLevel)
SECTION         (SecName [PK], Description)
ARTICLE         (ArtID [PK], Title, Content, Status, PubDate,
                 JournalistID [FK→JOURNALIST], EditorID [FK→EDITOR], SecName [FK→SECTION])
SOURCE          (SrcID [PK], SrcName, ContactInfo, TrustRating)
ARTICLE_SOURCE  (ArtID [PK, FK→ARTICLE], SrcID [PK, FK→SOURCE])   -- bridge table
SUBSCRIBER      (SubID [PK], Username, Email, MembershipType)
IMAGE           (ImgID [PK], ArtID [FK→ARTICLE], FilePath, Caption)
REVISION        (RevNo [PK], ArtID [PK, FK→ARTICLE], ChangesMade, EditTimestamp)
COMMENT_T       (CommID [PK], ArtID [FK→ARTICLE], SubID [FK→SUBSCRIBER], CommentText, CommentTime)
ADSPACE         (AdID [PK], SecName [FK→SECTION], Dimensions, Placement, Cost)
```

### 3.3 Normalization Proof

**1NF:** All attributes hold atomic (single) values. Every table has a clearly defined Primary Key.

**2NF:** No partial dependencies. Every non-key attribute is fully dependent on the entire primary key. REVISION: `(RevNo, ArtID)` is the composite PK — `ChangesMade` and `EditTimestamp` depend on both.

**3NF:** No transitive dependencies. In ARTICLE, `JournalistID` is a FK — journalist details like `SpecialtyArea` live in the JOURNALIST table, not duplicated in ARTICLE. This eliminates transitive dependency.

---

## 4. DDL — Table Creation (Oracle SQL)

> Run these scripts in Oracle SQL Developer **in the exact order shown** — foreign keys depend on parent tables being created first.

### Step 1 — EMPLOYEE Table

```sql
CREATE TABLE EMPLOYEE (
    EmpID       NUMBER(5)       PRIMARY KEY,
    EmpName     VARCHAR2(100)   NOT NULL,
    Email       VARCHAR2(150)   NOT NULL UNIQUE
);
```

### Step 2 — JOURNALIST Table (Subtype)

```sql
CREATE TABLE JOURNALIST (
    EmpID           NUMBER(5)       PRIMARY KEY,
    SpecialtyArea   VARCHAR2(100)   NOT NULL,
    CONSTRAINT fk_journalist_emp FOREIGN KEY (EmpID) REFERENCES EMPLOYEE(EmpID)
);
```

### Step 3 — EDITOR Table (Subtype)

```sql
CREATE TABLE EDITOR (
    EmpID           NUMBER(5)       PRIMARY KEY,
    SeniorityLevel  VARCHAR2(20)    NOT NULL
                    CHECK (SeniorityLevel IN ('Junior','Senior','Chief')),
    CONSTRAINT fk_editor_emp FOREIGN KEY (EmpID) REFERENCES EMPLOYEE(EmpID)
);
```

### Step 4 — SECTION Table

```sql
CREATE TABLE SECTION (
    SecName     VARCHAR2(50)    PRIMARY KEY,
    Description VARCHAR2(300)
);
```

### Step 5 — ARTICLE Table

```sql
CREATE TABLE ARTICLE (
    ArtID           NUMBER(7)       PRIMARY KEY,
    Title           VARCHAR2(300)   NOT NULL,
    Content         CLOB,
    Status          VARCHAR2(20)    DEFAULT 'Draft'
                    CHECK (Status IN ('Draft','Published','Archived')),
    PubDate         DATE,
    JournalistID    NUMBER(5)       NOT NULL,
    EditorID        NUMBER(5),
    SecName         VARCHAR2(50)    NOT NULL,
    CONSTRAINT fk_art_journalist FOREIGN KEY (JournalistID) REFERENCES JOURNALIST(EmpID),
    CONSTRAINT fk_art_editor     FOREIGN KEY (EditorID)     REFERENCES EDITOR(EmpID),
    CONSTRAINT fk_art_section    FOREIGN KEY (SecName)      REFERENCES SECTION(SecName)
);
```

### Step 6 — SOURCE Table

```sql
CREATE TABLE SOURCE (
    SrcID       NUMBER(5)       PRIMARY KEY,
    SrcName     VARCHAR2(150)   NOT NULL,
    ContactInfo VARCHAR2(200),
    TrustRating NUMBER(2,1)     CHECK (TrustRating BETWEEN 0 AND 10)
);
```

### Step 7 — ARTICLE_SOURCE Bridge Table (M:N)

```sql
CREATE TABLE ARTICLE_SOURCE (
    ArtID   NUMBER(7),
    SrcID   NUMBER(5),
    PRIMARY KEY (ArtID, SrcID),
    CONSTRAINT fk_artsrc_art FOREIGN KEY (ArtID) REFERENCES ARTICLE(ArtID),
    CONSTRAINT fk_artsrc_src FOREIGN KEY (SrcID) REFERENCES SOURCE(SrcID)
);
```

### Step 8 — SUBSCRIBER Table

```sql
CREATE TABLE SUBSCRIBER (
    SubID           NUMBER(7)       PRIMARY KEY,
    Username        VARCHAR2(80)    NOT NULL UNIQUE,
    Email           VARCHAR2(150)   NOT NULL UNIQUE,
    MembershipType  VARCHAR2(10)    DEFAULT 'Free'
                    CHECK (MembershipType IN ('Free','Premium'))
);
```

### Step 9 — IMAGE Table (Weak Entity)

```sql
CREATE TABLE IMAGE (
    ImgID       NUMBER(7)       PRIMARY KEY,
    ArtID       NUMBER(7)       NOT NULL,
    FilePath    VARCHAR2(300)   NOT NULL,
    Caption     VARCHAR2(300),
    CONSTRAINT fk_img_art FOREIGN KEY (ArtID) REFERENCES ARTICLE(ArtID)
);
```

### Step 10 — REVISION Table (Weak Entity)

```sql
CREATE TABLE REVISION (
    RevNo           NUMBER(5),
    ArtID           NUMBER(7),
    ChangesMade     VARCHAR2(500),
    EditTimestamp   DATE            DEFAULT SYSDATE,
    PRIMARY KEY (RevNo, ArtID),
    CONSTRAINT fk_rev_art FOREIGN KEY (ArtID) REFERENCES ARTICLE(ArtID)
);
```

### Step 11 — COMMENT_T Table (Weak Entity)

```sql
-- Note: Oracle reserves the word COMMENT, so we name the table COMMENT_T
CREATE TABLE COMMENT_T (
    CommID      NUMBER(7)       PRIMARY KEY,
    ArtID       NUMBER(7)       NOT NULL,
    SubID       NUMBER(7)       NOT NULL,
    CommentText VARCHAR2(1000)  NOT NULL,
    CommentTime DATE            DEFAULT SYSDATE,
    CONSTRAINT fk_comm_art FOREIGN KEY (ArtID) REFERENCES ARTICLE(ArtID),
    CONSTRAINT fk_comm_sub FOREIGN KEY (SubID) REFERENCES SUBSCRIBER(SubID)
);
```

### Step 12 — ADSPACE Table

```sql
CREATE TABLE ADSPACE (
    AdID        NUMBER(7)       PRIMARY KEY,
    SecName     VARCHAR2(50)    NOT NULL,
    Dimensions  VARCHAR2(50),
    Placement   VARCHAR2(30)    CHECK (Placement IN ('Banner','Sidebar','Footer')),
    Cost        NUMBER(8,2)     CHECK (Cost >= 0),
    CONSTRAINT fk_ad_section FOREIGN KEY (SecName) REFERENCES SECTION(SecName)
);
```

---

## 5. DCL — Data Control Language

### 5.1 User Roles

| User | Role | Access Level |
|---|---|---|
| `nams_admin` | Database Administrator | Full access to all tables |
| `nams_reporter` | Reporter / Read-Only | Can only SELECT |

### 5.2 Create Users (Run as SYSTEM/SYSDBA)

```sql
-- Create admin user
CREATE USER nams_admin IDENTIFIED BY Admin@1234;
GRANT CONNECT, RESOURCE, DBA TO nams_admin;

-- Create read-only reporter user
CREATE USER nams_reporter IDENTIFIED BY Reporter@1234;
GRANT CONNECT TO nams_reporter;
```

### 5.3 Grant SELECT to Reporter

```sql
GRANT SELECT ON EMPLOYEE       TO nams_reporter;
GRANT SELECT ON JOURNALIST     TO nams_reporter;
GRANT SELECT ON EDITOR         TO nams_reporter;
GRANT SELECT ON SECTION        TO nams_reporter;
GRANT SELECT ON ARTICLE        TO nams_reporter;
GRANT SELECT ON SOURCE         TO nams_reporter;
GRANT SELECT ON ARTICLE_SOURCE TO nams_reporter;
GRANT SELECT ON SUBSCRIBER     TO nams_reporter;
GRANT SELECT ON IMAGE          TO nams_reporter;
GRANT SELECT ON REVISION       TO nams_reporter;
GRANT SELECT ON COMMENT_T      TO nams_reporter;
GRANT SELECT ON ADSPACE        TO nams_reporter;
```

### 5.4 Grant DML to Admin

```sql
GRANT INSERT, UPDATE, DELETE ON EMPLOYEE       TO nams_admin;
GRANT INSERT, UPDATE, DELETE ON JOURNALIST     TO nams_admin;
GRANT INSERT, UPDATE, DELETE ON EDITOR         TO nams_admin;
GRANT INSERT, UPDATE, DELETE ON SECTION        TO nams_admin;
GRANT INSERT, UPDATE, DELETE ON ARTICLE        TO nams_admin;
GRANT INSERT, UPDATE, DELETE ON SOURCE         TO nams_admin;
GRANT INSERT, UPDATE, DELETE ON ARTICLE_SOURCE TO nams_admin;
GRANT INSERT, UPDATE, DELETE ON SUBSCRIBER     TO nams_admin;
GRANT INSERT, UPDATE, DELETE ON IMAGE          TO nams_admin;
GRANT INSERT, UPDATE, DELETE ON REVISION       TO nams_admin;
GRANT INSERT, UPDATE, DELETE ON COMMENT_T      TO nams_admin;
GRANT INSERT, UPDATE, DELETE ON ADSPACE        TO nams_admin;
```

### 5.5 Revoking Access (Example)

```sql
-- Remove delete access from admin on ARTICLE
REVOKE DELETE ON ARTICLE FROM nams_admin;

-- Remove all access from reporter on SUBSCRIBER
REVOKE SELECT ON SUBSCRIBER FROM nams_reporter;
```

---

## 6. Data Population — INSERT Statements

### 6.1 EMPLOYEE

```sql
INSERT INTO EMPLOYEE VALUES (1,  'Ahmed Raza',      'ahmed.raza@news.pk');
INSERT INTO EMPLOYEE VALUES (2,  'Sara Khan',       'sara.khan@news.pk');
INSERT INTO EMPLOYEE VALUES (3,  'Bilal Hussain',   'bilal.h@news.pk');
INSERT INTO EMPLOYEE VALUES (4,  'Nadia Iqbal',     'nadia.iq@news.pk');
INSERT INTO EMPLOYEE VALUES (5,  'Usman Tariq',     'usman.t@news.pk');
INSERT INTO EMPLOYEE VALUES (6,  'Zara Malik',      'zara.m@news.pk');
INSERT INTO EMPLOYEE VALUES (7,  'Hamza Sheikh',    'hamza.sh@news.pk');
INSERT INTO EMPLOYEE VALUES (8,  'Ayesha Farooq',   'ayesha.f@news.pk');
INSERT INTO EMPLOYEE VALUES (9,  'Faisal Mehmood',  'faisal.m@news.pk');
INSERT INTO EMPLOYEE VALUES (10, 'Sana Butt',       'sana.b@news.pk');
INSERT INTO EMPLOYEE VALUES (11, 'Waqar Ali',       'waqar.a@news.pk');
INSERT INTO EMPLOYEE VALUES (12, 'Maira Rizvi',     'maira.r@news.pk');
COMMIT;
```

### 6.2 JOURNALIST (Employees 1–7)

```sql
INSERT INTO JOURNALIST VALUES (1,  'Politics');
INSERT INTO JOURNALIST VALUES (2,  'Technology');
INSERT INTO JOURNALIST VALUES (3,  'Sports');
INSERT INTO JOURNALIST VALUES (4,  'Business');
INSERT INTO JOURNALIST VALUES (5,  'Health');
INSERT INTO JOURNALIST VALUES (6,  'Entertainment');
INSERT INTO JOURNALIST VALUES (7,  'World Affairs');
COMMIT;
```

### 6.3 EDITOR (Employees 8–12)

```sql
INSERT INTO EDITOR VALUES (8,  'Senior');
INSERT INTO EDITOR VALUES (9,  'Chief');
INSERT INTO EDITOR VALUES (10, 'Junior');
INSERT INTO EDITOR VALUES (11, 'Senior');
INSERT INTO EDITOR VALUES (12, 'Chief');
COMMIT;
```

### 6.4 SECTION

```sql
INSERT INTO SECTION VALUES ('Politics',       'National and international political news');
INSERT INTO SECTION VALUES ('Technology',     'Latest in tech, AI, and gadgets');
INSERT INTO SECTION VALUES ('Sports',         'Cricket, football, and more');
INSERT INTO SECTION VALUES ('Business',       'Economy, markets, and finance');
INSERT INTO SECTION VALUES ('Health',         'Medical news and wellness tips');
INSERT INTO SECTION VALUES ('Entertainment',  'Movies, music, and celebrities');
INSERT INTO SECTION VALUES ('World',          'International news and foreign affairs');
INSERT INTO SECTION VALUES ('Science',        'Research, space, and discoveries');
INSERT INTO SECTION VALUES ('Education',      'Schools, universities, and policy');
INSERT INTO SECTION VALUES ('Opinion',        'Editorial and opinion pieces');
COMMIT;
```

### 6.5 SOURCE

```sql
INSERT INTO SOURCE VALUES (1,  'Reuters',      'contact@reuters.com',   9.5);
INSERT INTO SOURCE VALUES (2,  'AP News',      'info@apnews.com',       9.2);
INSERT INTO SOURCE VALUES (3,  'BBC',          'newsroom@bbc.co.uk',    9.0);
INSERT INTO SOURCE VALUES (4,  'Dawn',         'editor@dawn.com',       8.5);
INSERT INTO SOURCE VALUES (5,  'Geo News',     'info@geo.tv',           7.8);
INSERT INTO SOURCE VALUES (6,  'Al Jazeera',   'info@aljazeera.net',    8.7);
INSERT INTO SOURCE VALUES (7,  'The Guardian', 'news@guardian.co.uk',   8.9);
INSERT INTO SOURCE VALUES (8,  'Bloomberg',    'tips@bloomberg.net',    9.1);
INSERT INTO SOURCE VALUES (9,  'Jang',         'desk@jang.com.pk',      7.5);
INSERT INTO SOURCE VALUES (10, 'The Nation',   'info@nation.com.pk',    7.2);
COMMIT;
```

### 6.6 ARTICLE

```sql
INSERT INTO ARTICLE VALUES (1,  'PM Announces New Budget',       'The budget focuses on...',      'Published', DATE '2024-01-10', 1, 8,  'Politics');
INSERT INTO ARTICLE VALUES (2,  'AI Revolution in Pakistan',     'Artificial intelligence is...', 'Published', DATE '2024-01-12', 2, 9,  'Technology');
INSERT INTO ARTICLE VALUES (3,  'Pakistan Wins Cricket Series',  'The national team...',          'Published', DATE '2024-01-14', 3, 10, 'Sports');
INSERT INTO ARTICLE VALUES (4,  'Stock Market Hits Record',      'The KSE-100 index...',          'Published', DATE '2024-01-16', 4, 11, 'Business');
INSERT INTO ARTICLE VALUES (5,  'New Cancer Treatment Found',    'Researchers have...',           'Published', DATE '2024-01-18', 5, 12, 'Health');
INSERT INTO ARTICLE VALUES (6,  'Bollywood Blockbuster Releases','The film earned...',            'Published', DATE '2024-01-20', 6, 8,  'Entertainment');
INSERT INTO ARTICLE VALUES (7,  'UN Summit on Climate',          'World leaders met...',          'Published', DATE '2024-01-22', 7, 9,  'World');
INSERT INTO ARTICLE VALUES (8,  'Mars Mission Update',           'NASA reports that...',          'Draft',     NULL,             2, 10, 'Science');
INSERT INTO ARTICLE VALUES (9,  'University Fee Hike Protests',  'Students across...',            'Published', DATE '2024-01-25', 1, 11, 'Education');
INSERT INTO ARTICLE VALUES (10, 'Opinion: The Economy We Need',  'The current policies...',       'Published', DATE '2024-01-27', 4, 12, 'Opinion');
INSERT INTO ARTICLE VALUES (11, 'Senate Debate on Water Bill',   'Senators debated...',           'Archived',  DATE '2024-01-05', 1, 8,  'Politics');
INSERT INTO ARTICLE VALUES (12, 'Startup Ecosystem Growing',     'Pakistan startups...',          'Published', DATE '2024-01-30', 2, 9,  'Technology');
COMMIT;
```

### 6.7 ARTICLE_SOURCE (Bridge Table)

```sql
INSERT INTO ARTICLE_SOURCE VALUES (1,  1);
INSERT INTO ARTICLE_SOURCE VALUES (1,  4);
INSERT INTO ARTICLE_SOURCE VALUES (2,  2);
INSERT INTO ARTICLE_SOURCE VALUES (2,  7);
INSERT INTO ARTICLE_SOURCE VALUES (3,  5);
INSERT INTO ARTICLE_SOURCE VALUES (4,  8);
INSERT INTO ARTICLE_SOURCE VALUES (5,  3);
INSERT INTO ARTICLE_SOURCE VALUES (6,  5);
INSERT INTO ARTICLE_SOURCE VALUES (7,  6);
INSERT INTO ARTICLE_SOURCE VALUES (8,  2);
INSERT INTO ARTICLE_SOURCE VALUES (9,  4);
INSERT INTO ARTICLE_SOURCE VALUES (10, 9);
COMMIT;
```

### 6.8 SUBSCRIBER

```sql
INSERT INTO SUBSCRIBER VALUES (1,  'ali_reader',   'ali@gmail.com',      'Free');
INSERT INTO SUBSCRIBER VALUES (2,  'zainab99',      'zainab@yahoo.com',   'Premium');
INSERT INTO SUBSCRIBER VALUES (3,  'khalid_pk',     'khalid@hotmail.com', 'Free');
INSERT INTO SUBSCRIBER VALUES (4,  'maryam_news',   'maryam@mail.com',    'Premium');
INSERT INTO SUBSCRIBER VALUES (5,  'tariq_fan',     'tariq@web.pk',       'Free');
INSERT INTO SUBSCRIBER VALUES (6,  'hina_writes',   'hina@gmail.com',     'Premium');
INSERT INTO SUBSCRIBER VALUES (7,  'junaid_r',      'junaid@live.com',    'Free');
INSERT INTO SUBSCRIBER VALUES (8,  'asma_pk',       'asma@yahoo.com',     'Free');
INSERT INTO SUBSCRIBER VALUES (9,  'rehman_daily',  'rehman@mail.pk',     'Premium');
INSERT INTO SUBSCRIBER VALUES (10, 'fatima_reads',  'fatima@gmail.com',   'Free');
COMMIT;
```

### 6.9 IMAGE

```sql
INSERT INTO IMAGE VALUES (1,  1, '/images/budget_press.jpg',   'PM at press conference');
INSERT INTO IMAGE VALUES (2,  1, '/images/parliament.jpg',     'Parliament building');
INSERT INTO IMAGE VALUES (3,  2, '/images/ai_chip.jpg',        'AI processor chip');
INSERT INTO IMAGE VALUES (4,  3, '/images/cricket_trophy.jpg', 'Victory celebration');
INSERT INTO IMAGE VALUES (5,  4, '/images/stock_graph.jpg',    'KSE-100 chart');
INSERT INTO IMAGE VALUES (6,  5, '/images/lab_research.jpg',   'Research lab');
INSERT INTO IMAGE VALUES (7,  6, '/images/movie_poster.jpg',   'Film poster');
INSERT INTO IMAGE VALUES (8,  7, '/images/un_summit.jpg',      'UN general assembly');
INSERT INTO IMAGE VALUES (9,  9, '/images/protest.jpg',        'Students protesting');
INSERT INTO IMAGE VALUES (10,12, '/images/startup_event.jpg',  'Startup pitch event');
COMMIT;
```

### 6.10 REVISION

```sql
INSERT INTO REVISION VALUES (1, 1,  'Corrected budget figures',        DATE '2024-01-11');
INSERT INTO REVISION VALUES (2, 1,  'Added PM quote',                  DATE '2024-01-12');
INSERT INTO REVISION VALUES (1, 2,  'Updated AI statistics',           DATE '2024-01-13');
INSERT INTO REVISION VALUES (1, 3,  'Fixed player names',              DATE '2024-01-15');
INSERT INTO REVISION VALUES (1, 4,  'Added analyst comments',          DATE '2024-01-17');
INSERT INTO REVISION VALUES (1, 5,  'Reviewed medical terminology',    DATE '2024-01-19');
INSERT INTO REVISION VALUES (1, 6,  'Added box office numbers',        DATE '2024-01-21');
INSERT INTO REVISION VALUES (1, 7,  'Updated delegate list',           DATE '2024-01-23');
INSERT INTO REVISION VALUES (1, 9,  'Added university names',          DATE '2024-01-26');
INSERT INTO REVISION VALUES (1, 12, 'Added investor quotes',           DATE '2024-01-31');
COMMIT;
```

### 6.11 COMMENT_T

```sql
INSERT INTO COMMENT_T VALUES (1,  1, 2, 'Great coverage of the budget!',        DATE '2024-01-11');
INSERT INTO COMMENT_T VALUES (2,  1, 5, 'I disagree with the tax policy.',       DATE '2024-01-12');
INSERT INTO COMMENT_T VALUES (3,  2, 3, 'AI is changing everything!',            DATE '2024-01-13');
INSERT INTO COMMENT_T VALUES (4,  3, 1, 'Pakistan cricket is back!',             DATE '2024-01-14');
INSERT INTO COMMENT_T VALUES (5,  4, 6, 'Investors are excited.',                DATE '2024-01-17');
INSERT INTO COMMENT_T VALUES (6,  5, 4, 'This treatment could save lives.',      DATE '2024-01-19');
INSERT INTO COMMENT_T VALUES (7,  6, 7, 'Loved the movie!',                      DATE '2024-01-21');
INSERT INTO COMMENT_T VALUES (8,  7, 8, 'Climate change is a global crisis.',    DATE '2024-01-23');
INSERT INTO COMMENT_T VALUES (9,  9, 9, 'Students have every right to protest.', DATE '2024-01-26');
INSERT INTO COMMENT_T VALUES (10,12,10, 'Pakistan startups are amazing!',        DATE '2024-01-31');
COMMIT;
```

### 6.12 ADSPACE

```sql
INSERT INTO ADSPACE VALUES (1,  'Politics',     '728x90',  'Banner',  5000.00);
INSERT INTO ADSPACE VALUES (2,  'Technology',   '300x250', 'Sidebar', 3500.00);
INSERT INTO ADSPACE VALUES (3,  'Sports',       '970x250', 'Banner',  6000.00);
INSERT INTO ADSPACE VALUES (4,  'Business',     '300x600', 'Sidebar', 4500.00);
INSERT INTO ADSPACE VALUES (5,  'Health',       '728x90',  'Footer',  2500.00);
INSERT INTO ADSPACE VALUES (6,  'Entertainment','320x480', 'Sidebar', 4000.00);
INSERT INTO ADSPACE VALUES (7,  'World',        '728x90',  'Banner',  4800.00);
INSERT INTO ADSPACE VALUES (8,  'Science',      '300x250', 'Sidebar', 3000.00);
INSERT INTO ADSPACE VALUES (9,  'Education',    '728x90',  'Footer',  2000.00);
INSERT INTO ADSPACE VALUES (10, 'Opinion',      '300x250', 'Sidebar', 2800.00);
COMMIT;
```

---

## 7. Advanced SQL Queries

### 7.1 JOINS

#### Query 1 — INNER JOIN: Published articles with journalist name and section

**Purpose:** Show which journalist wrote which article, and in which section.

```sql
SELECT A.ArtID, A.Title, E.EmpName AS Journalist, A.SecName, A.PubDate
FROM ARTICLE A
INNER JOIN JOURNALIST J ON A.JournalistID = J.EmpID
INNER JOIN EMPLOYEE   E ON J.EmpID        = E.EmpID
WHERE A.Status = 'Published'
ORDER BY A.PubDate DESC;
```

---

#### Query 2 — LEFT OUTER JOIN: All articles and their editor (include articles with no editor)

**Purpose:** Some articles may not yet have an assigned editor. LEFT JOIN ensures they still appear.

```sql
SELECT A.ArtID, A.Title, E.EmpName AS Editor, A.Status
FROM ARTICLE A
LEFT JOIN EDITOR   ED ON A.EditorID = ED.EmpID
LEFT JOIN EMPLOYEE E  ON ED.EmpID   = E.EmpID;
```

---

#### Query 3 — FULL OUTER JOIN: All journalists and all editors

**Purpose:** Show every journalist and every editor; rows from both sides appear even without a match.

```sql
SELECT E1.EmpName AS Journalist_Name, J.SpecialtyArea,
       E2.EmpName AS Editor_Name,     ED.SeniorityLevel
FROM JOURNALIST J
FULL OUTER JOIN EMPLOYEE E1 ON J.EmpID  = E1.EmpID
FULL OUTER JOIN EDITOR   ED ON ED.EmpID = E1.EmpID
FULL OUTER JOIN EMPLOYEE E2 ON ED.EmpID = E2.EmpID;
```

---

#### Query 4 — 3-Table JOIN: Articles with journalist, editor, and section info

```sql
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
```

---

### 7.2 SET OPERATIONS

#### Query 5 — UNION: All employee emails from both subtypes

**Purpose:** Get one combined list of emails from journalists and editors.

```sql
SELECT E.Email, 'Journalist' AS Role
FROM EMPLOYEE E INNER JOIN JOURNALIST J ON E.EmpID = J.EmpID
UNION
SELECT E.Email, 'Editor' AS Role
FROM EMPLOYEE E INNER JOIN EDITOR ED ON E.EmpID = ED.EmpID;
```

---

#### Query 6 — INTERSECT: Subscribers who commented on BOTH Politics and Technology articles

```sql
SELECT SubID FROM COMMENT_T WHERE ArtID IN
    (SELECT ArtID FROM ARTICLE WHERE SecName = 'Politics')
INTERSECT
SELECT SubID FROM COMMENT_T WHERE ArtID IN
    (SELECT ArtID FROM ARTICLE WHERE SecName = 'Technology');
```

---

#### Query 7 — MINUS: Journalists who have NOT written any article

```sql
SELECT EmpID FROM JOURNALIST
MINUS
SELECT JournalistID FROM ARTICLE;
```

---

### 7.3 SUBQUERIES

#### Query 8 — Non-correlated subquery: Articles by Technology journalists

**Purpose:** First find journalist IDs with specialty Technology, then find their articles.

```sql
SELECT Title, Status, PubDate
FROM ARTICLE
WHERE JournalistID IN (
    SELECT EmpID FROM JOURNALIST WHERE SpecialtyArea = 'Technology'
);
```

---

#### Query 9 — Correlated subquery: Articles with more than 1 comment

**Purpose:** For each article, the inner query counts its comments and compares.

```sql
SELECT A.ArtID, A.Title
FROM ARTICLE A
WHERE (
    SELECT COUNT(*) FROM COMMENT_T C WHERE C.ArtID = A.ArtID
) > 1;
```

---

#### Query 10 — Subquery with MAX: Article with the most revisions

```sql
SELECT ArtID, Title
FROM ARTICLE
WHERE ArtID = (
    SELECT ArtID
    FROM REVISION
    GROUP BY ArtID
    ORDER BY COUNT(*) DESC
    FETCH FIRST 1 ROW ONLY
);
```

---

#### Query 11 — EXISTS subquery: Subscribers who posted at least one comment

```sql
SELECT SubID, Username, MembershipType
FROM SUBSCRIBER S
WHERE EXISTS (
    SELECT 1 FROM COMMENT_T C WHERE C.SubID = S.SubID
);
```

---

### 7.4 Indexes

> Create indexes **after** inserting data. They speed up SELECT queries on frequently searched columns.

```sql
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
```

---

### 7.5 Views

#### View 1 — Published Articles with Author and Section

```sql
CREATE OR REPLACE VIEW vw_published_articles AS
SELECT A.ArtID, A.Title, E.EmpName AS Journalist,
       A.SecName, A.PubDate
FROM ARTICLE A
JOIN JOURNALIST J ON A.JournalistID = J.EmpID
JOIN EMPLOYEE   E ON J.EmpID        = E.EmpID
WHERE A.Status = 'Published';

-- Usage:
SELECT * FROM vw_published_articles ORDER BY PubDate DESC;
```

#### View 2 — Article Comment Count

```sql
CREATE OR REPLACE VIEW vw_article_comments AS
SELECT A.ArtID, A.Title, COUNT(C.CommID) AS TotalComments
FROM ARTICLE A
LEFT JOIN COMMENT_T C ON A.ArtID = C.ArtID
GROUP BY A.ArtID, A.Title;

-- Usage:
SELECT * FROM vw_article_comments ORDER BY TotalComments DESC;
```

#### View 3 — Section AdSpace Revenue

```sql
CREATE OR REPLACE VIEW vw_section_revenue AS
SELECT SecName, COUNT(AdID) AS TotalAds, SUM(Cost) AS TotalRevenue
FROM ADSPACE
GROUP BY SecName;

-- Usage:
SELECT * FROM vw_section_revenue ORDER BY TotalRevenue DESC;
```

---

## 8. PL/SQL — Packages, Cursors, Triggers, Object Types

### 8.1 Anonymous Block — Print Total Published Articles

```sql
DECLARE
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM ARTICLE WHERE Status = 'Published';
    DBMS_OUTPUT.PUT_LINE('Total Published Articles: ' || v_count);
END;
/
```

---

### 8.2 Package — Article Manager

A package groups related procedures and functions. It has two parts: the **SPEC** (declaration) and the **BODY** (implementation).

#### Package Spec

```sql
CREATE OR REPLACE PACKAGE article_manager AS

    -- Procedure: Publish an article by ArtID
    PROCEDURE publish_article(p_artid IN NUMBER);

    -- Procedure: Archive an article
    PROCEDURE archive_article(p_artid IN NUMBER);

    -- Function: Return total articles written by a journalist
    FUNCTION count_articles(p_journalistid IN NUMBER) RETURN NUMBER;

END article_manager;
/
```

#### Package Body

```sql
CREATE OR REPLACE PACKAGE BODY article_manager AS

    PROCEDURE publish_article(p_artid IN NUMBER) IS
    BEGIN
        UPDATE ARTICLE
        SET Status = 'Published', PubDate = SYSDATE
        WHERE ArtID = p_artid;
        COMMIT;
        DBMS_OUTPUT.PUT_LINE('Article ' || p_artid || ' published successfully.');
    END publish_article;

    PROCEDURE archive_article(p_artid IN NUMBER) IS
    BEGIN
        UPDATE ARTICLE
        SET Status = 'Archived'
        WHERE ArtID = p_artid;
        COMMIT;
        DBMS_OUTPUT.PUT_LINE('Article ' || p_artid || ' archived.');
    END archive_article;

    FUNCTION count_articles(p_journalistid IN NUMBER) RETURN NUMBER IS
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count
        FROM ARTICLE
        WHERE JournalistID = p_journalistid;
        RETURN v_count;
    END count_articles;

END article_manager;
/
```

#### Calling the Package

```sql
-- Publish article 8 (was in Draft)
BEGIN
    article_manager.publish_article(8);
END;
/

-- Count articles by journalist 1
BEGIN
    DBMS_OUTPUT.PUT_LINE(article_manager.count_articles(1));
END;
/
```

---

### 8.3 Explicit Cursor — List Articles with Comment Count

A cursor processes query results row by row.

```sql
DECLARE
    -- Step 1: Declare the cursor
    CURSOR c_articles IS
        SELECT A.ArtID, A.Title, COUNT(C.CommID) AS NumComments
        FROM ARTICLE A
        LEFT JOIN COMMENT_T C ON A.ArtID = C.ArtID
        GROUP BY A.ArtID, A.Title;

    -- Step 2: Declare a row variable
    v_row c_articles%ROWTYPE;
BEGIN
    -- Step 3: Open the cursor
    OPEN c_articles;
    LOOP
        -- Step 4: Fetch rows one by one
        FETCH c_articles INTO v_row;
        EXIT WHEN c_articles%NOTFOUND;
        DBMS_OUTPUT.PUT_LINE(
            'Article: ' || v_row.Title ||
            ' | Comments: ' || v_row.NumComments
        );
    END LOOP;
    -- Step 5: Close the cursor
    CLOSE c_articles;
END;
/
```

---

### 8.4 Triggers

#### Trigger 1 — AFTER INSERT on ARTICLE: Auto-create first revision

This trigger fires automatically every time a new article is inserted.

```sql
CREATE OR REPLACE TRIGGER trg_article_insert
AFTER INSERT ON ARTICLE
FOR EACH ROW
BEGIN
    INSERT INTO REVISION (RevNo, ArtID, ChangesMade, EditTimestamp)
    VALUES (1, :NEW.ArtID, 'Article first created', SYSDATE);
END;
/
```

---

#### Trigger 2 — BEFORE UPDATE on ARTICLE: Block publishing without an editor

```sql
CREATE OR REPLACE TRIGGER trg_check_editor
BEFORE UPDATE OF Status ON ARTICLE
FOR EACH ROW
BEGIN
    IF :NEW.Status = 'Published' AND :NEW.EditorID IS NULL THEN
        RAISE_APPLICATION_ERROR(-20001,
            'Cannot publish article without an assigned editor.');
    END IF;
END;
/
```

---

#### Trigger 3 — AFTER UPDATE on ARTICLE: Auto-add revision entry

```sql
CREATE OR REPLACE TRIGGER trg_article_update
AFTER UPDATE ON ARTICLE
FOR EACH ROW
DECLARE
    v_next_rev NUMBER;
BEGIN
    SELECT NVL(MAX(RevNo), 0) + 1 INTO v_next_rev
    FROM REVISION WHERE ArtID = :NEW.ArtID;

    INSERT INTO REVISION(RevNo, ArtID, ChangesMade, EditTimestamp)
    VALUES (v_next_rev, :NEW.ArtID, 'Article updated', SYSDATE);
END;
/
```

---

### 8.5 Object Types

#### Type Spec

```sql
CREATE OR REPLACE TYPE article_summary_type AS OBJECT (
    artid        NUMBER,
    title        VARCHAR2(300),
    journalist   VARCHAR2(100),
    num_comments NUMBER,

    -- Member function that returns a formatted string
    MEMBER FUNCTION get_info RETURN VARCHAR2
);
/
```

#### Type Body

```sql
CREATE OR REPLACE TYPE BODY article_summary_type AS

    MEMBER FUNCTION get_info RETURN VARCHAR2 IS
    BEGIN
        RETURN 'ID: ' || artid ||
               ' | Title: ' || title ||
               ' | By: ' || journalist ||
               ' | Comments: ' || num_comments;
    END get_info;

END;
/
```

#### Using the Object Type

```sql
DECLARE
    v_summary article_summary_type;
BEGIN
    v_summary := article_summary_type(1, 'PM Announces New Budget', 'Ahmed Raza', 2);
    DBMS_OUTPUT.PUT_LINE(v_summary.get_info());
END;
/
```

---

## 9. Tech Stack & Frontend

### 9.1 Tech Stack

| Layer | Technology | Why? |
|---|---|---|
| **Frontend** | HTML5 + CSS3 + Vanilla JS | No framework needed; fast; beginner-friendly |
| **Backend API** | Node.js + Express.js | Simple REST API; minimal code |
| **DB Driver** | oracledb (npm) | Official Oracle driver for Node.js |
| **Database** | Oracle 11g express edition (free) | Full Oracle features; free for academic use |

### 9.2 Folder Structure

```
nams-project/
├── backend/
│   ├── server.js              ← Main Express server
│   ├── db.js                  ← Oracle DB connection
│   └── routes/
│       ├── articles.js        ← Article CRUD API
│       ├── journalists.js     ← Journalist API
│       └── subscribers.js     ← Subscriber API
├── frontend/
│   ├── index.html             ← Homepage (article list)
│   ├── articles.html          ← Article management
│   ├── journalists.html       ← Journalist management
│   ├── subscribers.html       ← Subscriber management
│   ├── css/
│   │   └── style.css          ← All styling
│   └── js/
│       └── main.js            ← All API calls
└── sql/
    ├── 01_ddl.sql             ← Table creation
    ├── 02_dcl.sql             ← GRANT/REVOKE
    ├── 03_data.sql            ← INSERT statements
    ├── 04_queries.sql         ← All SQL queries
    └── 05_plsql.sql           ← PL/SQL code
```

### 9.3 Backend — db.js (Oracle Connection)

```javascript
// Install first: npm install express oracledb cors
const oracledb = require('oracledb');

async function getConnection() {
    return await oracledb.getConnection({
        user:          'nams_admin',
        password:      'Admin@1234',
        connectString: 'localhost/XEPDB1'   // Oracle XE default
    });
}

module.exports = { getConnection };
```

### 9.4 Backend — server.js

```javascript
const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

const articles    = require('./routes/articles');
const journalists = require('./routes/journalists');
const subscribers = require('./routes/subscribers');

app.use('/api/articles',    articles);
app.use('/api/journalists', journalists);
app.use('/api/subscribers', subscribers);

app.listen(3000, () => console.log('NAMS API running on port 3000'));
```

### 9.5 Backend — articles.js (Full CRUD)

```javascript
const express  = require('express');
const router   = express.Router();
const oracledb = require('oracledb');
const { getConnection } = require('../db');

// GET all articles
router.get('/', async (req, res) => {
    const conn = await getConnection();
    const result = await conn.execute(
        `SELECT A.ArtID, A.Title, E.EmpName AS Journalist,
                A.SecName, A.Status, A.PubDate
         FROM ARTICLE A
         JOIN JOURNALIST J ON A.JournalistID = J.EmpID
         JOIN EMPLOYEE   E ON J.EmpID = E.EmpID`,
        [], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    await conn.close();
    res.json(result.rows);
});

// GET single article
router.get('/:id', async (req, res) => {
    const conn = await getConnection();
    const result = await conn.execute(
        `SELECT * FROM ARTICLE WHERE ArtID = :id`,
        [req.params.id], { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    await conn.close();
    res.json(result.rows[0]);
});

// POST create article
router.post('/', async (req, res) => {
    const { ArtID, Title, Content, Status, JournalistID, EditorID, SecName } = req.body;
    const conn = await getConnection();
    await conn.execute(
        `INSERT INTO ARTICLE VALUES (:1,:2,:3,:4,SYSDATE,:5,:6,:7)`,
        [ArtID, Title, Content, Status, JournalistID, EditorID, SecName],
        { autoCommit: true }
    );
    await conn.close();
    res.json({ message: 'Article created' });
});

// PUT update article status
router.put('/:id', async (req, res) => {
    const conn = await getConnection();
    await conn.execute(
        `UPDATE ARTICLE SET Status = :1 WHERE ArtID = :2`,
        [req.body.Status, req.params.id],
        { autoCommit: true }
    );
    await conn.close();
    res.json({ message: 'Article updated' });
});

// DELETE article
router.delete('/:id', async (req, res) => {
    const conn = await getConnection();
    await conn.execute(
        `DELETE FROM ARTICLE WHERE ArtID = :id`,
        [req.params.id], { autoCommit: true }
    );
    await conn.close();
    res.json({ message: 'Article deleted' });
});

module.exports = router;
```

### 9.6 Frontend — index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NAMS — News Agency Management System</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <!-- Navigation Bar -->
  <nav class="navbar">
    <div class="logo">📰 NAMS</div>
    <ul class="nav-links">
      <li><a href="index.html">Home</a></li>
      <li><a href="articles.html">Articles</a></li>
      <li><a href="journalists.html">Journalists</a></li>
      <li><a href="subscribers.html">Subscribers</a></li>
    </ul>
  </nav>

  <!-- Hero Section -->
  <div class="hero">
    <h1>News Agency Management System</h1>
    <p>Manage articles, journalists, editors, and more.</p>
  </div>

  <!-- Stats Cards -->
  <div class="stats-grid">
    <div class="stat-card"><h2 id="total-articles">--</h2><p>Total Articles</p></div>
    <div class="stat-card"><h2 id="total-journalists">--</h2><p>Journalists</p></div>
    <div class="stat-card"><h2 id="total-subscribers">--</h2><p>Subscribers</p></div>
    <div class="stat-card"><h2 id="total-sections">--</h2><p>Sections</p></div>
  </div>

  <!-- Latest Articles Table -->
  <div class="container">
    <h2 class="section-title">Latest Published Articles</h2>
    <table class="data-table" id="articles-table">
      <thead>
        <tr>
          <th>ID</th><th>Title</th><th>Journalist</th>
          <th>Section</th><th>Date</th><th>Actions</th>
        </tr>
      </thead>
      <tbody id="articles-body"></tbody>
    </table>
  </div>

  <script src="js/main.js"></script>
</body>
</html>
```

### 9.7 Frontend — css/style.css (Navy + Gold Theme)

```css
/* Reset */
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', sans-serif; background: #f4f6f9; color: #333; }

/* Navbar */
.navbar {
    background: #1a3c5e;
    padding: 15px 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.logo { color: #f5a623; font-size: 1.5rem; font-weight: bold; }
.nav-links { list-style: none; display: flex; gap: 25px; }
.nav-links a { color: white; text-decoration: none; font-size: 0.95rem; }
.nav-links a:hover { color: #f5a623; }

/* Hero */
.hero {
    background: linear-gradient(135deg, #1a3c5e, #2e86ab);
    color: white;
    text-align: center;
    padding: 60px 20px;
}
.hero h1 { font-size: 2.5rem; margin-bottom: 10px; }
.hero p  { font-size: 1.1rem; opacity: 0.85; }

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    padding: 30px;
    max-width: 1100px;
    margin: 0 auto;
}
.stat-card {
    background: white;
    border-radius: 10px;
    text-align: center;
    padding: 25px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}
.stat-card h2 { font-size: 2rem; color: #1a3c5e; }
.stat-card p  { color: #888; margin-top: 5px; }

/* Container */
.container { max-width: 1100px; margin: 0 auto; padding: 20px 30px; }
.section-title {
    font-size: 1.4rem;
    color: #1a3c5e;
    margin-bottom: 15px;
    border-left: 4px solid #f5a623;
    padding-left: 12px;
}

/* Table */
.data-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
}
.data-table thead { background: #1a3c5e; color: white; }
.data-table th, .data-table td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #eee;
}
.data-table tbody tr:hover { background: #eaf4fb; }

/* Buttons */
.btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    margin: 2px;
}
.btn-primary { background: #2e86ab; color: white; }
.btn-danger  { background: #e74c3c; color: white; }
.btn-success { background: #27ae60; color: white; }
.btn:hover   { opacity: 0.85; }

/* Form */
.form-card {
    background: white;
    border-radius: 10px;
    padding: 25px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    margin-bottom: 25px;
}
.form-group { margin-bottom: 15px; }
.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 600;
    color: #1a3c5e;
}
.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.95rem;
}
.form-group input:focus { outline: none; border-color: #2e86ab; }

/* Status badges */
.badge            { padding: 4px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: bold; }
.badge-published  { background: #d4edda; color: #155724; }
.badge-draft      { background: #fff3cd; color: #856404; }
.badge-archived   { background: #f8d7da; color: #721c24; }
```

### 9.8 Frontend — js/main.js

```javascript
const API = 'http://localhost:3000/api';

// Load all articles into table
async function loadArticles() {
    const res  = await fetch(`${API}/articles`);
    const data = await res.json();
    const tbody = document.getElementById('articles-body');
    tbody.innerHTML = '';
    data.forEach(article => {
        tbody.innerHTML += `
        <tr>
            <td>${article.ARTID}</td>
            <td>${article.TITLE}</td>
            <td>${article.JOURNALIST}</td>
            <td>${article.SECNAME}</td>
            <td>${article.PUBDATE ? new Date(article.PUBDATE).toLocaleDateString() : 'N/A'}</td>
            <td>
                <button class="btn btn-success" onclick="publishArticle(${article.ARTID})">Publish</button>
                <button class="btn btn-danger"  onclick="deleteArticle(${article.ARTID})">Delete</button>
            </td>
        </tr>`;
    });
}

// Publish an article
async function publishArticle(id) {
    await fetch(`${API}/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Status: 'Published' })
    });
    loadArticles();
}

// Delete an article
async function deleteArticle(id) {
    if (!confirm('Delete this article?')) return;
    await fetch(`${API}/articles/${id}`, { method: 'DELETE' });
    loadArticles();
}

// Add new article from form
async function addArticle() {
    const body = {
        ArtID:        document.getElementById('artid').value,
        Title:        document.getElementById('title').value,
        Content:      document.getElementById('content').value,
        Status:       'Draft',
        JournalistID: document.getElementById('journalist').value,
        EditorID:     document.getElementById('editor').value,
        SecName:      document.getElementById('section').value
    };
    await fetch(`${API}/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    loadArticles();
}

// Run on page load
loadArticles();
```

---

## 10. Technical Constraints & ACID Properties

### 10.1 Constraints Summary

| Table | Column | Constraint | Rule |
|---|---|---|---|
| EMPLOYEE | EmpID | PRIMARY KEY | Unique, not null |
| EMPLOYEE | Email | UNIQUE, NOT NULL | No duplicate emails |
| EDITOR | SeniorityLevel | CHECK | Junior / Senior / Chief only |
| ARTICLE | Status | CHECK + DEFAULT | Draft / Published / Archived; default Draft |
| ARTICLE | JournalistID | FOREIGN KEY | References JOURNALIST.EmpID |
| SUBSCRIBER | MembershipType | CHECK + DEFAULT | Free / Premium; default Free |
| ADSPACE | Placement | CHECK | Banner / Sidebar / Footer |
| ADSPACE | Cost | CHECK | Must be >= 0 |
| SOURCE | TrustRating | CHECK | Between 0 and 10 |

### 10.2 ACID Properties in NAMS

**Atomicity:** Every DML operation is followed by `COMMIT`. On error, Oracle automatically rolls back the failed transaction. PL/SQL triggers use `COMMIT` after every DML for all-or-nothing execution.

**Consistency:** CHECK constraints on Status, SeniorityLevel, MembershipType, Placement, and Cost ensure the database never holds invalid data. Foreign keys prevent referential integrity violations.

**Isolation:** Oracle handles isolation automatically at the transaction level. Each SQL session sees a consistent snapshot of the data.

**Durability:** Every `COMMIT` ensures data survives system failures. Oracle's redo logs guarantee persistence.

---

## 11. Step-by-Step: How to Run the Project

### Step 1 — Install Oracle XE 21c
1. Download Oracle Database 21c Express Edition (free) from `oracle.com/database/technologies/xe-downloads.html`
2. Install and set the SYSTEM password.
3. Open SQL Developer and connect: username = `system`, password = (what you set).

### Step 2 — Run SQL Scripts in Order
1. Open SQL Developer → New Worksheet.
2. Copy-paste and run `01_ddl.sql` (all CREATE TABLE statements) — one by one in order.
3. Run `02_dcl.sql` (GRANT/REVOKE). You may need SYSDBA for `CREATE USER`.
4. Run `03_data.sql` (all INSERT statements).
5. Run `04_queries.sql` — verify all query outputs look correct.
6. Run `05_plsql.sql` — packages, triggers, and types.

### Step 3 — Set Up the Backend

```bash
# Open terminal in nams-project/backend/
npm init -y
npm install express oracledb cors
node server.js
# You should see: NAMS API running on port 3000
```

### Step 4 — Open the Frontend
1. Open `frontend/index.html` in your browser (double-click, or use VS Code Live Server).
2. The page connects to your backend at `http://localhost:3000`.
3. You should see the articles table populated from Oracle.

### Step 5 — Test CRUD Operations
- **CREATE:** Fill the form on `articles.html` → click Add Article.
- **READ:** The table auto-loads all articles from the DB.
- **UPDATE:** Click Publish to change article status.
- **DELETE:** Click Delete to remove an article.

---

## 12. API Endpoints Reference

| Method | Endpoint | Action | Description |
|---|---|---|---|
| GET | `/api/articles` | Read All | Returns all articles with journalist and section |
| GET | `/api/articles/:id` | Read One | Returns single article by ArtID |
| POST | `/api/articles` | Create | Creates a new article |
| PUT | `/api/articles/:id` | Update | Updates article status |
| DELETE | `/api/articles/:id` | Delete | Deletes an article |
| GET | `/api/journalists` | Read All | Returns all journalists with specialty |
| POST | `/api/journalists` | Create | Adds a new journalist |
| GET | `/api/subscribers` | Read All | Returns all subscribers |
| POST | `/api/subscribers` | Create | Registers a new subscriber |
| DELETE | `/api/subscribers/:id` | Delete | Removes a subscriber |

---

## 13. Inputs, Outputs & Features Summary

### 13.1 Inputs (What the User Enters)

| Feature | Input Fields |
|---|---|
| Add Article | Article ID, Title, Content, Status, Journalist ID, Editor ID, Section |
| Add Journalist | Employee ID, Name, Email, Specialty Area |
| Add Editor | Employee ID, Name, Email, Seniority Level |
| Add Subscriber | Subscriber ID, Username, Email, Membership Type |
| Add Comment | Comment ID, Article ID, Subscriber ID, Comment Text |
| Add Source | Source ID, Name, Contact Info, Trust Rating |
| Add Section | Section Name, Description |
| Add AdSpace | Ad ID, Section Name, Dimensions, Placement, Cost |
| Update Article | Article ID, New Status (Dropdown) |
| Delete Record | ID of record to delete |

### 13.2 Outputs (What the System Shows)

| Screen / View | Output Displayed |
|---|---|
| Homepage | Total counts: articles, journalists, subscribers, sections |
| Articles Page | Table: ID, Title, Journalist, Section, Status, Date, Actions |
| Journalists Page | Table: ID, Name, Email, Specialty Area, Article Count |
| Subscribers Page | Table: ID, Username, Email, Membership Type, Comment Count |
| Section Stats | Table: Section Name, Article Count, Ad Count, Revenue |
| Article Details | Full content, images, revisions, comments, sources |

---

## 14. Submission Checklist

Use this checklist before submitting your project:

| # | Item | File / Location | Done? |
|---|---|---|---|
| 1 | Title Page & Introduction | Project Report PDF | ☐ |
| 2 | SRS Document | Project Report PDF | ☐ |
| 3 | ERD Diagram | Design Document PNG/PDF | ☐ |
| 4 | EERD Diagram (specialization shown) | Design Document PNG/PDF | ☐ |
| 5 | Normalized Schema (3NF proof) | Project Report PDF | ☐ |
| 6 | DDL Script (all 12 CREATE TABLE) | sql/01_ddl.sql | ☐ |
| 7 | DCL Script (GRANT/REVOKE) | sql/02_dcl.sql | ☐ |
| 8 | Data Population (10+ rows each) | sql/03_data.sql | ☐ |
| 9 | SQL Queries (JOIN, SET, Subquery) | sql/04_queries.sql | ☐ |
| 10 | Indexes (6 indexes created) | sql/04_queries.sql | ☐ |
| 11 | Views (3 views created) | sql/04_queries.sql | ☐ |
| 12 | PL/SQL Package (spec + body) | sql/05_plsql.sql | ☐ |
| 13 | Explicit Cursor | sql/05_plsql.sql | ☐ |
| 14 | 3 Triggers (BEFORE + AFTER) | sql/05_plsql.sql | ☐ |
| 15 | Object Type + Body | sql/05_plsql.sql | ☐ |
| 16 | Frontend (HTML + CSS + JS) | frontend/ folder | ☐ |
| 17 | Backend API (Node.js + Express) | backend/ folder | ☐ |
| 18 | Screenshots of table creation | Implementation Logs | ☐ |
| 19 | Screenshots of DCL execution | Implementation Logs | ☐ |
| 20 | Screenshots of running queries | Implementation Logs | ☐ |

---

*Good luck with your project!*
