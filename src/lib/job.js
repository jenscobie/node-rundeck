var P = require('bluebird');
var asyncWhile = require('async-while').generate(P);
var request = require('request');
var util = require('util');
var xml2js = require('xml2js').parseString;
var execute = require('../lib/rundeck-job-gateway');
var getExecution = require('../lib/rundeck-execution-gateway').getExecution;
var getOutput = require('../lib/rundeck-execution-gateway').getOutput;

function getExecutionId(response) {
  var execution = response.executions.execution[0];
  return execution.$.id;
}

function getStatus(response) {
  var execution = response.executions.execution[0];
  return execution.$.status;
}

function isFailed(response, id) {
  var message = util.format("Execution of job '%s' failed", id);
  var status = getStatus(response);
  if (status === 'failed') {
    console.error(message);
    throw new Error(message);
  }
  return false;
}

function isSucceeded(response, id) {
  var message = util.format("Execution of job '%s' succeeded", id);
  var status = getStatus(response);
  if (status === 'succeeded') {
    console.log(message);
    return true;
  }
  return false;
}

function run(host, port, apiVersion, authToken, id, arguments) {
  return execute(host, port, apiVersion, authToken, id, arguments)
    .then(handleResponse);

  function handleResponse(response) {
    var executionId = getExecutionId(response);
    var status = getStatus(response);

    var loop = asyncWhile(
      (response) =>
      {
        isFailed(response, id);
        return !isSucceeded(response, id);
      },
      (response) =>
      {
        return P.delay(500)
          .then(() => {
            return getExecution(host, port, apiVersion, authToken, executionId)
          });
      }
    );

    return loop(response);
  }
}

module.exports = run;
