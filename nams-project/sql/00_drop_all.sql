-- 1. Drop Views
drop view vw_published_articles;
drop view vw_article_comments;
drop view vw_section_revenue;

-- 2. Drop Packages and Types
drop package article_manager;
drop type article_summary_type;

-- 3. Drop Tables (Child tables first, then Parents)
drop table adspace cascade constraints;
drop table comment_t cascade constraints;
drop table revision cascade constraints;
drop table image cascade constraints;
drop table subscriber cascade constraints;
drop table article_source cascade constraints;
drop table source cascade constraints;
drop table article cascade constraints;
drop table section cascade constraints;
drop table editor cascade constraints;
drop table journalist cascade constraints;
drop table employee cascade constraints;

-- 4. Drop Users (Optional: only if you also want to take screenshots of User Creation)
-- NOTE: You must run these two lines while logged in as SYSTEM / SYSDBA.
-- DROP USER nams_admin CASCADE;
-- DROP USER nams_reporter CASCADE;

purge recyclebin;