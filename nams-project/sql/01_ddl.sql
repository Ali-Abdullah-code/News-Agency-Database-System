-- EMPLOYEE Table
create table employee (
   empid   number(5) primary key,
   empname varchar2(100) not null,
   email   varchar2(150) not null unique
);

-- JOURNALIST Table (Subtype)
create table journalist (
   empid         number(5) primary key,
   specialtyarea varchar2(100) not null,
   constraint fk_journalist_emp foreign key ( empid )
      references employee ( empid )
);

-- EDITOR Table (Subtype)
create table editor (
   empid          number(5) primary key,
   senioritylevel varchar2(20) not null check ( senioritylevel in ( 'Junior',
                                                                    'Senior',
                                                                    'Chief' ) ),
   constraint fk_editor_emp foreign key ( empid )
      references employee ( empid )
);

-- SECTION Table
create table section (
   secname     varchar2(50) primary key,
   description varchar2(300)
);

-- ARTICLE Table
create table article (
   artid        number(7) primary key,
   title        varchar2(300) not null,
   content      clob,
   status       varchar2(20) default 'Draft' check ( status in ( 'Draft',
                                                           'Published',
                                                           'Archived' ) ),
   pubdate      date,
   journalistid number(5) not null,
   editorid     number(5),
   secname      varchar2(50) not null,
   constraint fk_art_journalist foreign key ( journalistid )
      references journalist ( empid ),
   constraint fk_art_editor foreign key ( editorid )
      references editor ( empid ),
   constraint fk_art_section foreign key ( secname )
      references section ( secname )
);

-- SOURCE Table
create table source (
   srcid       number(5) primary key,
   srcname     varchar2(150) not null,
   contactinfo varchar2(200),
   trustrating number(2,1) check ( trustrating between 0 and 10 )
);

-- ARTICLE_SOURCE Bridge Table (M:N)
create table article_source (
   artid number(7),
   srcid number(5),
   primary key ( artid,
                 srcid ),
   constraint fk_artsrc_art foreign key ( artid )
      references article ( artid ),
   constraint fk_artsrc_src foreign key ( srcid )
      references source ( srcid )
);

-- SUBSCRIBER Table
create table subscriber (
   subid          number(7) primary key,
   username       varchar2(80) not null unique,
   email          varchar2(150) not null unique,
   membershiptype varchar2(10) default 'Free' check ( membershiptype in ( 'Free',
                                                                          'Premium' ) )
);

-- IMAGE Table (Weak Entity)
create table image (
   imgid    number(7) primary key,
   artid    number(7) not null,
   filepath varchar2(300) not null,
   caption  varchar2(300),
   constraint fk_img_art foreign key ( artid )
      references article ( artid )
);

-- REVISION Table (Weak Entity)
create table revision (
   revno         number(5),
   artid         number(7),
   changesmade   varchar2(500),
   edittimestamp date default sysdate,
   primary key ( revno,
                 artid ),
   constraint fk_rev_art foreign key ( artid )
      references article ( artid )
);

-- COMMENT_T Table (Weak Entity)
create table comment_t (
   commid      number(7) primary key,
   artid       number(7) not null,
   subid       number(7) not null,
   commenttext varchar2(1000) not null,
   commenttime date default sysdate,
   constraint fk_comm_art foreign key ( artid )
      references article ( artid ),
   constraint fk_comm_sub foreign key ( subid )
      references subscriber ( subid )
);

-- ADSPACE Table
create table adspace (
   adid       number(7) primary key,
   secname    varchar2(50) not null,
   dimensions varchar2(50),
   placement  varchar2(30) check ( placement in ( 'Banner',
                                                 'Sidebar',
                                                 'Footer' ) ),
   cost       number(8,2) check ( cost >= 0 ),
   constraint fk_ad_section foreign key ( secname )
      references section ( secname )
);