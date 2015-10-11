# node-rundeck
> An incomplete implementation of a [Rundeck](http://rundeck.org/) API client

## Requirements

* [Docker](http://docker.io/)

## Installation

1. Install requirements listed above
2. ```./go``` to validate the project is setup correctly

## Usage

    Usage: ./go <command>

    Available commands are:
      coverage      Run test coverage and view report
      run           Start the Rundeck server
      test          Run entire test suite

## Acceptance Tests

This project has a suite of tests covering the main functionality of the project.

If you modify the project and want to verify your changes (and that you haven't broken anything else), run the tests with the ```./go test``` command.

## Author

Jen Scobie (jenscobie@gmail.com)
