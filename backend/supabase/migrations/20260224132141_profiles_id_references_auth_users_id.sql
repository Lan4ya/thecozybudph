ALTER TABLE "profiles" 
ADD CONSTRAINT "profiles_id_auth_users_id_fk" 
FOREIGN KEY ("id") REFERENCES "auth"."users"("id") 
ON DELETE CASCADE;
