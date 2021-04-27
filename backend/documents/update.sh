#!/bin/sh

echo "clery-documents: docker image updating"

USERNAME=rodesc

docker build -t clery-documents .

docker tag clery-documents "$USERNAME"/clery-documents
docker push "$USERNAME"/clery-documents