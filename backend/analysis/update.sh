#!/bin/sh

echo "clery-boiler: docker image updating"

USERNAME=rodesc

docker build -t clery-boiler .

docker tag clery-boiler "$USERNAME"/clery-boiler
docker push "$USERNAME"/clery-boiler