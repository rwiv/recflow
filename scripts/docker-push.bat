cd ..
set IMG=ghcr.io/rwiv/stmgr:0.1.7
set DOCKERFILE=./docker/Dockerfile

docker rmi %IMG%

docker build -t %IMG% -f %DOCKERFILE% .
docker push %IMG%

docker rmi %IMG%
pause