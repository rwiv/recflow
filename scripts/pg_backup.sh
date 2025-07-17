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

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUTFILE="bak_${TIMESTAMP}.sql"

#pg_dump --data-only -f "./dev/$OUTFILE" --exclude-schema=drizzle
pg_dump -f "./dev/$OUTFILE" --exclude-schema=drizzle
