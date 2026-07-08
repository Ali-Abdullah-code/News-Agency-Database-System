declare
   v_count number;
begin
   select count(*)
     into v_count
     from article
    where status = 'Published';
   dbms_output.put_line('Total Published Articles: ' || v_count);
end;
/

create or replace package article_manager as

    -- Procedure: Publish an article by ArtID
   procedure publish_article (
      p_artid in number
   );

    -- Procedure: Archive an article
   procedure archive_article (
      p_artid in number
   );

    -- Function: Return total articles written by a journalist
   function count_articles (
      p_journalistid in number
   ) return number;

end article_manager;
/

create or replace package body article_manager as

   procedure publish_article (
      p_artid in number
   ) is
   begin
      update article
         set status = 'Published',
             pubdate = sysdate
       where artid = p_artid;
      commit;
      dbms_output.put_line('Article '
                           || p_artid || ' published successfully.');
   end publish_article;

   procedure archive_article (
      p_artid in number
   ) is
   begin
      update article
         set
         status = 'Archived'
       where artid = p_artid;
      commit;
      dbms_output.put_line('Article '
                           || p_artid || ' archived.');
   end archive_article;

   function count_articles (
      p_journalistid in number
   ) return number is
      v_count number;
   begin
      select count(*)
        into v_count
        from article
       where journalistid = p_journalistid;
      return v_count;
   end count_articles;

end article_manager;
/

-- Publish article 8 
begin
   article_manager.publish_article(8);
end;
/

-- Count articles by journalist 1
begin
   dbms_output.put_line(article_manager.count_articles(1));
end;
/

declare
    -- Step 1: Declare the cursor
   cursor c_articles is
   select a.artid,
          a.title,
          count(c.commid) as numcomments
     from article a
     left join comment_t c
   on a.artid = c.artid
    group by a.artid,
             a.title;

    -- Step 2: Declare a row variable
   v_row c_articles%rowtype;
begin
    -- Step 3: Open the cursor
   open c_articles;
   loop
        -- Step 4: Fetch rows one by one
      fetch c_articles into v_row;
      exit when c_articles%notfound;
      dbms_output.put_line('Article: '
                           || v_row.title
                           || ' | Comments: ' || v_row.numcomments);
   end loop;
    -- Step 5: Close the cursor
   close c_articles;
end;
/

create or replace trigger trg_article_insert after
   insert on article
   for each row
begin
   insert into revision (
      revno,
      artid,
      changesmade,
      edittimestamp
   ) values ( 1,
              :new.artid,
              'Article first created',
              sysdate );
end;
/

create or replace trigger trg_check_editor before
   update of status on article
   for each row
begin
   if
      :new.status = 'Published'
      and :new.editorid is null
   then
      raise_application_error(
         -20001,
         'Cannot publish article without an assigned editor.'
      );
   end if;
end;
/

create or replace trigger trg_article_update after
   update on article
   for each row
declare
   v_next_rev number;
begin
   select nvl(
      max(revno),
      0
   ) + 1
     into v_next_rev
     from revision
    where artid = :new.artid;

   insert into revision (
      revno,
      artid,
      changesmade,
      edittimestamp
   ) values ( v_next_rev,
              :new.artid,
              'Article updated',
              sysdate );
end;
/

create or replace type article_summary_type as object (
      artid        number,
      title        varchar2(300),
      journalist   varchar2(100),
      num_comments number,

    -- Member function that returns a formatted string
      member function get_info return varchar2
);
/

create or replace type body article_summary_type as
   member function get_info return varchar2 is
   begin
      return 'ID: '
             || artid
             || ' | Title: '
             || title
             || ' | By: '
             || journalist
             || ' | Comments: '
             || num_comments;
   end get_info;

end;
/

declare
   v_summary article_summary_type;
begin
   v_summary := article_summary_type(
      1,
      'PM Announces New Budget',
      'Ahmed Raza',
      2
   );
   dbms_output.put_line(v_summary.get_info());
end;
/