#!/bin/sh

echo "clery-gateway: docker image updating"

USERNAME=rodesc

docker build -t clery-gateway .

docker tag clery-gateway "$USERNAME"/clery-gateway
docker push "$USERNAME"/clery-gateway