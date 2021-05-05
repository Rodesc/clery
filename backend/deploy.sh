#!/bin/bash

echo "Deploying Back-End"

declare -a Services=("users" "documents" "gateway" "analysis")
context_name=clery_aci

# define directory of the script and cd to it
dir=$(cd -P -- "$(dirname -- "$0")" && pwd -P) || exit
cd "${dir%/}" || exit

function clean {
  # clean tmp folder
  echo "Removing all data from databases"
  rm -r tmp
}

function cleanVolumes {
  echo "WARNING: cleaning volumes"
  docker volume ls | awk '$1 == "local" { print $2 }' | xargs --no-run-if-empty docker volume rm
}

function update {
  cd $SERVICE/ || exit
  sh update.sh 
  cd ..
}

function updateAll {
  echo ""
  echo "Updating all service images ..."
  
  # Read the array values with space
  for val in "${Services[@]}"; do
    SERVICE=$val
    update
  done
}

POSITIONAL=()
while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    # clean all databases 
    -c|--clean) 
    clean
    shift
    ;;
    # update a single service
    -s|--service) 
    SERVICE="$2"
    update
    shift
    shift
    ;;
    # update all services
    -a|--all)
    updateAll
    shift
    ;;
    # clean DB and update all services
    -d|--deep)
    docker-compose down
    clean
    cleanVolumes
    updateAll
    shift
    ;;
    -o|--online) 
    echo ONLINE=true
    shift
    ;;
    *)    # unknown option
    POSITIONAL+=("$1")
    shift
    ;;
esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters

docker-compose up --remove-orphans





