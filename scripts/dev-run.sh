#!/bin/sh

cd ..
ENV_FILE="./dev/.env"

if [ ! -f $ENV_FILE ]; then
  echo "not found .env file"
  exit 1
fi

export $(grep -v '^#' $ENV_FILE | xargs)

#pnpm run build
node ./dist/index.js
