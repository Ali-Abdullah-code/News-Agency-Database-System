# News Agency Management System (NAMS)

[![Oracle](https://img.shields.io/badge/Oracle-21c-F80000?style=flat-square&logo=oracle&logoColor=white)](https://www.oracle.com/database/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![JavaScript](https://img.shields.io/badge/Frontend-Vanilla_JS-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Complete-brightgreen?style=flat-square)]()

**NAMS** is a full-stack relational database application that models the complete operational workflow of a digital news agency. It covers the entire lifecycle of a news article — from authorship and editorial review through publication, subscriber engagement, revision auditing, and advertisement management — backed by a normalized Oracle database and exposed via a RESTful API.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Database Design](#database-design)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [SQL Scripts Reference](#sql-scripts-reference)
- [Key Technical Concepts](#key-technical-concepts)
- [Project Documentation](#project-documentation)

---

## Overview

The system manages twelve interconnected entities representing the real-world structure of a news organization. Core capabilities include:

- **Article lifecycle management** — Draft, Published, and Archived status transitions.
- **Employee specialization** — A disjoint ISA hierarchy separating Journalists (authors) from Editors (reviewers).
- **Revision auditing** — A complete, immutable edit history for every article.
- **Source citation tracking** — Many-to-many linking of articles to verified news sources (Reuters, BBC, AP, etc.).
- **Subscriber engagement** — Comment threading on articles with Free and Premium membership tiers.
- **Advertisement management** — AdSpace placements (Banner, Sidebar, Footer) tracked per news section.
- **Role-based database security** — Separate database users with fine-grained `GRANT`/`REVOKE` permissions.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Client Layer                           │
│           HTML5 + CSS3 + Vanilla JavaScript (Browser)           │
│    Pages: Articles | Journalists | Editors | Subscribers        │
└────────────────────────────┬────────────────────────────────────┘
                             │  HTTP / REST (JSON)
┌────────────────────────────▼────────────────────────────────────┐
│                         API Layer                               │
│                   Node.js + Express.js                          │
│         Routes: /api/articles  /api/journalists                 │
│                 /api/editors   /api/subscribers                  │
│                     Port: 3000                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │  node-oracledb driver
┌────────────────────────────▼────────────────────────────────────┐
│                       Database Layer                            │
│                    Oracle Database 21c                          │
│    Tables, Views, Indexes, Triggers, Packages, Object Types     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Design

### Entity Relationship Summary

| Relationship | Entities | Cardinality | Notes |
|---|---|---|---|
| Writes | Journalist → Article | 1 : M | One journalist authors many articles |
| Reviews | Editor → Article | 1 : M | One editor reviews many articles |
| Categorized In | Article → Section | M : 1 | Each article belongs to one section |
| Cites | Article ↔ Source | M : N | Resolved via `ARTICLE_SOURCE` bridge table |
| Features | Section → AdSpace | 1 : M | One section hosts many ad placements |
| Contains | Article → Image | 1 : M | Weak entity — dependent on Article |
| Undergoes | Article → Revision | 1 : M | Weak entity — audit trail |
| Attached To | Article → Comment | 1 : M | Weak entity — subscriber-authored |
| Posts | Subscriber → Comment | 1 : M | One subscriber posts many comments |

### Relational Schema (3NF Normalized)

```
EMPLOYEE        (EmpID [PK], EmpName, Email)
JOURNALIST      (EmpID [PK, FK → EMPLOYEE], SpecialtyArea)
EDITOR          (EmpID [PK, FK → EMPLOYEE], SeniorityLevel)
SECTION         (SecName [PK], Description)
ARTICLE         (ArtID [PK], Title, Content, Status, PubDate,
                 JournalistID [FK → JOURNALIST],
                 EditorID     [FK → EDITOR],
                 SecName      [FK → SECTION])
SOURCE          (SrcID [PK], SrcName, ContactInfo, TrustRating)
ARTICLE_SOURCE  (ArtID [PK, FK → ARTICLE], SrcID [PK, FK → SOURCE])
SUBSCRIBER      (SubID [PK], Username, Email, MembershipType)
IMAGE           (ImgID [PK], ArtID [FK → ARTICLE], FilePath, Caption)
REVISION        (RevNo [PK], ArtID [PK, FK → ARTICLE], ChangesMade, EditTimestamp)
COMMENT_T       (CommID [PK], ArtID [FK → ARTICLE], SubID [FK → SUBSCRIBER],
                 CommentText, CommentTime)
ADSPACE         (AdID [PK], SecName [FK → SECTION], Dimensions, Placement, Cost)
```

> `COMMENT_T` is named with a suffix because `COMMENT` is a reserved keyword in Oracle SQL.

---

## Technology Stack

| Component | Technology | Version |
|---|---|---|
| Database | Oracle Database | 21c (XE) |
| Database Driver | node-oracledb | Latest |
| Runtime | Node.js | 16+ |
| API Framework | Express.js | 4.x |
| Frontend | HTML5, CSS3, Vanilla JavaScript | — |
| Dev Tools | Oracle SQL Developer, SQL*Plus | — |

---

## Project Structure

```
News-Agency-Database-System/
│
├── NAMS_Project_Document.md        # Full project documentation (SRS, EERD, queries)
│
└── nams-project/
    ├── sql/
    │   ├── 00_drop_all.sql         # Drops all tables (use for clean reset)
    │   ├── 01_ddl.sql              # CREATE TABLE statements with all constraints
    │   ├── 02_dcl.sql              # User creation, GRANT and REVOKE statements
    │   ├── 03_data.sql             # INSERT statements — 10+ rows per table
    │   ├── 04_queries.sql          # Advanced SELECT queries, views, and indexes
    │   └── 05_plsql.sql            # Packages, cursors, triggers, and object types
    │
    ├── backend/
    │   ├── server.js               # Express application entry point (port 3000)
    │   ├── db.js                   # Oracle DB connection configuration
    │   └── routes/
    │       ├── articles.js         # CRUD endpoints for ARTICLE
    │       ├── journalists.js      # CRUD endpoints for JOURNALIST
    │       ├── editors.js          # CRUD endpoints for EDITOR
    │       └── subscribers.js      # CRUD endpoints for SUBSCRIBER
    │
    └── frontend/
        ├── index.html              # Dashboard / landing page
        ├── articles.html           # Article management UI
        ├── journalists.html        # Journalist management UI
        ├── editors.html            # Editor management UI
        ├── subscribers.html        # Subscriber management UI
        ├── css/                    # Stylesheets
        └── js/                     # Frontend JavaScript modules
```

---

## Getting Started

### Prerequisites

- Oracle Database 21c or Oracle XE 21c installed and running.
- Oracle Instant Client configured (required by `node-oracledb`).
- Node.js v16 or later.
- Git.

### Step 1 — Clone the Repository

```bash
git clone https://github.com/yourusername/News-Agency-Database-System.git
cd News-Agency-Database-System
```

### Step 2 — Initialize the Database

Open **Oracle SQL Developer** and connect as `SYSDBA`. Run the scripts in `nams-project/sql/` in strict sequential order:

```sql
-- Run in Oracle SQL Developer or SQL*Plus:

@00_drop_all.sql       -- Only required if resetting an existing schema
@01_ddl.sql            -- Creates all 12 tables with primary keys, foreign keys, and check constraints
@02_dcl.sql            -- Creates nams_admin and nams_reporter users with appropriate privileges
@03_data.sql           -- Inserts realistic mock data (10+ rows per table)
@04_queries.sql        -- Creates views (vw_published_articles, etc.) and performance indexes
@05_plsql.sql          -- Deploys PL/SQL packages, triggers, cursors, and object types
```

### Step 3 — Configure the Database Connection

Edit `nams-project/backend/db.js` and update the connection credentials to match your Oracle instance:

```javascript
// db.js
const oracledb = require('oracledb');

async function getConnection() {
    return await oracledb.getConnection({
        user:             'your_schema_user',
        password:         'your_password',
        connectString:    'localhost/XEPDB1'   // Adjust service name as needed
    });
}

module.exports = { getConnection };
```

### Step 4 — Start the Backend Server

```bash
cd nams-project/backend
npm install
npm start
```

The API will be available at `http://localhost:3000`.

### Step 5 — Open the Frontend

Open `nams-project/frontend/index.html` directly in any modern web browser. No build step is required.

---

## API Reference

All endpoints accept and return `application/json`. The base URL is `http://localhost:3000`.

### Articles — `/api/articles`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/articles` | Retrieve all articles with journalist name and section |
| `GET` | `/api/articles/:id` | Retrieve a single article by ID |
| `POST` | `/api/articles` | Create a new article |
| `PUT` | `/api/articles/:id` | Update an article's status |
| `DELETE` | `/api/articles/:id` | Delete an article by ID |

**POST /api/articles — Request Body**

```json
{
  "ArtID":        101,
  "Title":        "Pakistan Wins Series",
  "Content":      "Full article text here...",
  "Status":       "Draft",
  "JournalistID": 3,
  "EditorID":     9,
  "SecName":      "Sports"
}
```

### Journalists — `/api/journalists`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/journalists` | Retrieve all journalists with employee details |
| `GET` | `/api/journalists/:id` | Retrieve a single journalist by ID |
| `POST` | `/api/journalists` | Add a new journalist (creates EMPLOYEE + JOURNALIST records) |
| `PUT` | `/api/journalists/:id` | Update a journalist's specialty area |
| `DELETE` | `/api/journalists/:id` | Remove a journalist record |

### Editors — `/api/editors`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/editors` | Retrieve all editors with seniority level |
| `GET` | `/api/editors/:id` | Retrieve a single editor by ID |
| `POST` | `/api/editors` | Add a new editor |
| `PUT` | `/api/editors/:id` | Update an editor's seniority level |
| `DELETE` | `/api/editors/:id` | Remove an editor record |

### Subscribers — `/api/subscribers`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/subscribers` | Retrieve all subscribers |
| `GET` | `/api/subscribers/:id` | Retrieve a single subscriber by ID |
| `POST` | `/api/subscribers` | Register a new subscriber |
| `PUT` | `/api/subscribers/:id` | Update subscriber membership type |
| `DELETE` | `/api/subscribers/:id` | Remove a subscriber record |

---

## SQL Scripts Reference

### Database Users and Roles (`02_dcl.sql`)

| User | Privileges | Purpose |
|---|---|---|
| `nams_admin` | `CONNECT`, `RESOURCE`, `DBA`, full DML on all tables | Administrative access |
| `nams_reporter` | `CONNECT`, `SELECT` on all tables | Read-only reporting access |

### Views Created (`04_queries.sql`)

| View | Description |
|---|---|
| `vw_published_articles` | Published articles with journalist name and section |
| `vw_article_comments` | Articles with total comment count |
| `vw_section_revenue` | Total AdSpace revenue grouped by section |

### PL/SQL Components (`05_plsql.sql`)

| Component | Type | Description |
|---|---|---|
| Article status automation | Trigger | Automatically archives articles past a defined date |
| Revision logger | Trigger | Inserts a revision record on every article update |
| Journalist package | Package | Encapsulated procedures for journalist reporting |
| Subscriber cursor | Cursor | Iterates over premium subscribers for batch operations |
| Article object type | Object Type | Structured Oracle object representing an article |

---

## Key Technical Concepts

### Normalization

The schema is normalized to **Third Normal Form (3NF)**:

- **1NF** — All attributes are atomic. Every table has a defined primary key.
- **2NF** — No partial dependencies. Every non-key attribute depends on the full primary key (relevant to composite keys in `REVISION` and `ARTICLE_SOURCE`).
- **3NF** — No transitive dependencies. Journalist details such as `SpecialtyArea` are stored in the `JOURNALIST` table, not duplicated in `ARTICLE`.

### ISA Specialization (Disjoint)

`EMPLOYEE` is the supertype. `JOURNALIST` and `EDITOR` are disjoint subtypes — an employee record belongs to exactly one subtype, not both. Referential integrity is enforced via foreign keys from each subtype back to `EMPLOYEE`.

### Weak Entities

`REVISION`, `IMAGE`, and `COMMENT_T` are weak entities — their existence depends entirely on a parent `ARTICLE`. Their primary keys incorporate `ArtID` as a partial identifier, enforced via identifying relationships.

### ACID Compliance

All data modification operations (`INSERT`, `UPDATE`, `DELETE`) are wrapped in explicit transactions with `COMMIT`. The Express routes use `autoCommit: true` through the `node-oracledb` driver, ensuring each API operation is atomic.

---

## Project Documentation

A comprehensive project document is included in this repository, covering:

- Full Software Requirements Specification (SRS)
- EERD diagram description with all cardinalities and participation constraints
- Normalization proof (1NF through 3NF/BCNF)
- Complete DDL, DCL, DML, and PL/SQL scripts with line-by-line explanations
- Advanced query examples (11 queries covering JOINs, subqueries, and set operations)
- API endpoint reference and frontend walkthrough

See: [NAMS\_Project\_Document.md](./NAMS_Project_Document.md)

---

## License

This project is released under the [MIT License](LICENSE).

---

*Developed as part of the Database Systems course — Oracle 21c | Session 2024–2025.*
