#!/bin/sh

ENV_FILE=../dev/.env
if [ ! -f $ENV_FILE ]; then
  echo "not found .env file"
  exit 1
fi

export $(grep -v '^#' $ENV_FILE | xargs)

export PGHOST="$PG_DEV_HOST"
export PGPORT="$PG_DEV_PORT"
export PGUSER="$PG_USERNAME"
export PGDATABASE="$PG_DATABASE"

psql -f ../dev/explain.sql
