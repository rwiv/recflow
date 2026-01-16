cd ..
set IMG=harbor.rwiv.xyz/private/recflow:2.5.6
set DOCKERFILE=./docker/Dockerfile

docker rmi %IMG%

docker build -t %IMG% -f %DOCKERFILE% .
docker push %IMG%

docker rmi %IMG%
pause