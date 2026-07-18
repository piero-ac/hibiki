


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (id, username, target_jlpt_level)
  values (
    new.id,
    split_part(new.email, '@', 1), -- Injects everything before the '@' as a temporary username
    'N5'
  );
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."attempts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "user_id" "uuid" NOT NULL,
    "sentence_id" "uuid" NOT NULL,
    "audio_attempt_url" "text",
    "accuracy_score" numeric(5,2) NOT NULL,
    "user_audio_transcript" "text",
    CONSTRAINT "attempts_accuracy_score_check" CHECK ((("accuracy_score" >= 0.00) AND ("accuracy_score" <= 100.00)))
);


ALTER TABLE "public"."attempts" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."attempts_summary" WITH ("security_invoker"='true') AS
 SELECT "count"(*) AS "total_attempts",
    "round"("avg"("accuracy_score")) AS "average_score",
    "count"(DISTINCT "sentence_id") AS "sentences_practiced",
    "count"(DISTINCT ("created_at")::"date") AS "days_practiced"
   FROM "public"."attempts"
  WHERE ("user_id" = "auth"."uid"());


ALTER VIEW "public"."attempts_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "username" "text",
    "target_jlpt_level" "text" DEFAULT 'N5'::"text",
    CONSTRAINT "profiles_target_jlpt_level_check" CHECK (("target_jlpt_level" = ANY (ARRAY['N5'::"text", 'N4'::"text", 'N3'::"text", 'N2'::"text", 'N1'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sentences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "japanese_text" "text" NOT NULL,
    "kana_text" "text" NOT NULL,
    "english_translation" "text" NOT NULL,
    "audio_prompt_url" "text" NOT NULL,
    "jlpt_level" "text" NOT NULL,
    "category" "text",
    CONSTRAINT "sentences_jlpt_level_check" CHECK (("jlpt_level" = ANY (ARRAY['N5'::"text", 'N4'::"text", 'N3'::"text", 'N2'::"text", 'N1'::"text"])))
);


ALTER TABLE "public"."sentences" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."recent_attempts" WITH ("security_invoker"='true') AS
 SELECT "a"."id",
    "a"."created_at",
    "a"."accuracy_score",
    "a"."user_audio_transcript",
    "s"."id" AS "sentence_id",
    "s"."japanese_text",
    "s"."english_translation",
    "s"."kana_text",
    "s"."jlpt_level",
    "s"."category"
   FROM ("public"."attempts" "a"
     JOIN "public"."sentences" "s" ON (("s"."id" = "a"."sentence_id")))
  WHERE ("a"."user_id" = "auth"."uid"())
  ORDER BY "a"."created_at" DESC;


ALTER VIEW "public"."recent_attempts" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."sentence_progress" WITH ("security_invoker"='true') AS
 SELECT "a"."sentence_id",
    "s"."japanese_text",
    "s"."english_translation",
    "s"."jlpt_level",
    "s"."category",
    "count"(*) AS "attempt_count",
    "round"("avg"("a"."accuracy_score")) AS "average_score",
    "max"("a"."accuracy_score") AS "best_score",
    "min"("a"."accuracy_score") AS "lowest_score",
    "max"("a"."created_at") AS "last_attempted"
   FROM ("public"."attempts" "a"
     JOIN "public"."sentences" "s" ON (("s"."id" = "a"."sentence_id")))
  WHERE ("a"."user_id" = "auth"."uid"())
  GROUP BY "a"."sentence_id", "s"."japanese_text", "s"."english_translation", "s"."jlpt_level", "s"."category";


ALTER VIEW "public"."sentence_progress" OWNER TO "postgres";


ALTER TABLE ONLY "public"."attempts"
    ADD CONSTRAINT "attempts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."sentences"
    ADD CONSTRAINT "sentences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."attempts"
    ADD CONSTRAINT "attempts_sentence_id_fkey" FOREIGN KEY ("sentence_id") REFERENCES "public"."sentences"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."attempts"
    ADD CONSTRAINT "attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Authenticated users can read all sentences" ON "public"."sentences" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can insert their own practice attempts" ON "public"."attempts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own practice attempts" ON "public"."attempts" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."attempts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sentences" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";


















GRANT ALL ON TABLE "public"."attempts" TO "anon";
GRANT ALL ON TABLE "public"."attempts" TO "authenticated";
GRANT ALL ON TABLE "public"."attempts" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."attempts_summary" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."attempts_summary" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."attempts_summary" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."sentences" TO "anon";
GRANT ALL ON TABLE "public"."sentences" TO "authenticated";
GRANT ALL ON TABLE "public"."sentences" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."recent_attempts" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."recent_attempts" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."recent_attempts" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."sentence_progress" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."sentence_progress" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."sentence_progress" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT UPDATE ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT UPDATE ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT UPDATE ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "service_role";



































drop extension if exists "pg_net";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "admin_upload 1jgvrq_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'audio'::text) AND ((auth.jwt() ->> 'role'::text) = 'admin'::text)));



  create policy "authenticated_users_read 1jgvrq_0"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'audio'::text));



