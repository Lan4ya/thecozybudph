CREATE OR REPLACE FUNCTION public.auto_enable_rls_on_create()
RETURNS event_trigger
LANGUAGE plpgsql
AS $$
DECLARE
    obj record;
BEGIN
    FOR obj IN 
        SELECT * FROM pg_event_trigger_ddl_commands() 
        WHERE command_tag = 'CREATE TABLE' AND object_type = 'table'
    LOOP
        IF obj.schema_name = 'public' THEN
            -- Casting the objid to a regclass safely creates a clean, quoted identifier
            EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY;', obj.objid::regclass);
        END IF;
    END LOOP;
END;
$$;

CREATE EVENT TRIGGER trigger_auto_enable_rls
ON ddl_command_end
WHEN tag IN ('CREATE TABLE')
EXECUTE FUNCTION public.auto_enable_rls_on_create();
