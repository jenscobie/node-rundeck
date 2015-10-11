#!/bin/bash

set -e -u

function help_text {
    echo "Usage: ./go <command>"
    echo ""
    echo "Available commands are:"
    echo "    coverage      Run test coverage and view report"
    echo "    run           Start the Rundeck server"
    echo "    test          Run entire test suite"
}

function start_rundeck {
  IP_ADDRESS=`docker-machine ip default`
  PORT=4440
  DOCKER_IMAGE=jordan/rundeck

  export SERVER_URL=http://$IP_ADDRESS:$PORT

  docker pull $DOCKER_IMAGE

  if [[ $(docker ps) != *$DOCKER_IMAGE* ]]; then
    docker run -p $PORT:$PORT -e SERVER_URL=http://$IP_ADDRESS:$PORT -t $DOCKER_IMAGE:latest;
  fi

  echo "Rundeck URL: $SERVER_URL"
}

function test_coverage {
   npm run-script test-cov
}

function unit_test {
  npm test
}

[[ $@ ]] || { help_text; exit 1; }

case "$1" in
    coverage) test_coverage
    ;;
    run) start_rundeck
    ;;
    test) unit_test
    ;;
    help) help_text
    ;;
esac
