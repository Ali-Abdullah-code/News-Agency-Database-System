-- Create admin user
CREATE USER nams_admin IDENTIFIED BY "Admin@1234";
GRANT CONNECT, RESOURCE, DBA TO nams_admin;

-- Create read-only reporter user
CREATE USER nams_reporter IDENTIFIED BY "Reporter@1234";
GRANT CONNECT TO nams_reporter;

-- Grant SELECT to Reporter
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

-- Grant DML to Admin
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
