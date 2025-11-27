cd ..
set IMG=harbor.rwiv.xyz/private/recflow:2.4.3
set DOCKERFILE=./docker/Dockerfile

docker rmi %IMG%

docker build -t %IMG% -f %DOCKERFILE% .
docker push %IMG%

docker rmi %IMG%
pause