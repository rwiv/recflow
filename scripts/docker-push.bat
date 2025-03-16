cd ..
set IMG=harbor.rwiv.xyz/private/stmgr:0.7.2
set DOCKERFILE=./docker/Dockerfile

docker rmi %IMG%

docker build -t %IMG% -f %DOCKERFILE% .
docker push %IMG%

docker rmi %IMG%
pause