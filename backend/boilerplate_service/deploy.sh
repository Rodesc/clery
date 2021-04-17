#!/bin/sh

if [ -z "$1" ]; then
  echo "No action performed. If you want to do an action, pass the status of the deployment [\"run\", \"update\", \"updateAndRun\"] as first argument."
fi

STATUS=$1
USERNAME=$(docker info | sed '/Username:/!d;s/.* //')

docker stop users-service > /dev/null
docker rm users-service > /dev/null

docker build -t scapp-auth .

docker run -d -p 3001:80 --name users-service --link users-db scapp-auth
# if [ "$STATUS" = "update" ] || [ "$STATUS" = "updateAndRun" ]; then
#   docker tag scapp-auth "$USERNAME"/scapp-auth
#   docker push "$USERNAME"/scapp-auth
# elif [ "$STATUS" = "run" ] || [ "$STATUS" = "updateAndRun" ]; then
#   docker run -d -p 3001:80 --name users-service --link users-db scapp-auth
# fi
