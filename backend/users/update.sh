#!/bin/sh

echo "clery-users: docker image updating"

USERNAME=rodesc

docker build -t clery-users .

docker tag clery-users "$USERNAME"/clery-users
docker push "$USERNAME"/clery-users