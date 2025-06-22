#!/bin/sh

cd ..
ENV_FILE=./dev/.env
if [ ! -f $ENV_FILE ]; then
  echo "not found .env file"
  exit 1
fi

export $(grep -v '^#' $ENV_FILE | xargs)

export PGHOST="$PG_PROD_HOST"
export PGPORT="$PG_PROD_PORT"
export PGUSER="$PG_USERNAME"
export PGDATABASE="$PG_DATABASE"

psql -c "
DO \$\$
DECLARE r RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'drizzle') THEN
        DROP SCHEMA drizzle CASCADE;
    END IF;

    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typtype = 'e')
    LOOP
        EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;
END \$\$;"
