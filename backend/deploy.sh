#!/bin/bash

echo "Deploying Back-End"

if [ -z "$1" ]; then
  STATUS="updateAndRun"
  echo "Provide run, update or updateAndRun as argument"
else
  STATUS=$1
fi

# define directory of the script and cd to it
dir=$(cd -P -- "$(dirname -- "$0")" && pwd -P) || exit
cd "${dir%/}" || exit


if [ "$STATUS" = "update" ] || [ "$STATUS" = "updateAndRun" ]; then
  echo ""
  echo "Updating all service images ..."

  # update users microservice
  cd users/ || exit
  sh update.sh "$STATUS"
  cd ..

fi
docker-compose up --remove-orphans