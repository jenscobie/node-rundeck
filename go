#!/usr/bin/env bash

IP_ADDRESS=`docker-machine ip default`
PORT=4440
DOCKER_IMAGE=jordan/rundeck

export SERVER_URL=http://$IP_ADDRESS:$PORT
export AUTH_TOKEN='<set-this-value>'

docker pull $DOCKER_IMAGE

if [[ $(docker ps) != *$DOCKER_IMAGE* ]]; then
  docker run -p $PORT:$PORT -e SERVER_URL=http://$IP_ADDRESS:$PORT -t $DOCKER_IMAGE:latest;
fi

echo "Rundeck URL: $SERVER_URL"
