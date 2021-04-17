#!/bin/sh

echo "clery-auth: docker image updating"

USERNAME=rodesc

docker stop users-service > /dev/null
docker rm users-service > /dev/null

docker build -t clery-auth .

docker tag clery-auth "$USERNAME"/clery-auth
docker push "$USERNAME"/clery-auth