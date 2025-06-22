#!/bin/sh

ENV_FILE=../dev/.env
if [ ! -f $ENV_FILE ]; then
  echo "not found .env file"
  exit 1
fi

export $(grep -v '^#' $ENV_FILE | xargs)

export PGHOST="$PG_PROD_HOST"
export PGPORT="$PG_PROD_PORT"
export PGUSER="$PG_USERNAME"
export PGDATABASE="$PG_DATABASE"

if [ -z "$1" ]; then
  echo "argument is required"
  exit 1
fi

psql -f $1
