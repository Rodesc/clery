#!/bin/sh

echo "clery-frontend: docker image updating"

USERNAME=rodesc

docker build -t clery-frontend .

docker tag clery-frontend "$USERNAME"/clery-frontend
docker push "$USERNAME"/clery-frontend