cd ..
set IMG=harbor.rwiv.xyz/private/stmgr:1.1.0
set DOCKERFILE=./docker/Dockerfile

docker rmi %IMG%

docker build -t %IMG% -f %DOCKERFILE% .
docker push %IMG%

docker rmi %IMG%
pause