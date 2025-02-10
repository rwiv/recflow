cd ..
set "USING_PG_PROD_PORT=true"
node dist/batch/main.js migrate
pause