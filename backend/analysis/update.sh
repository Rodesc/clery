#!/bin/sh

echo "clery-analysis: docker image updating"

USERNAME=rodesc

docker build -t clery-analysis .

docker tag clery-analysis "$USERNAME"/clery-analysis
docker push "$USERNAME"/clery-analysis