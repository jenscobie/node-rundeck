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

function message(executionId, status) {
  return util.format("Execution of job '%s' %s", executionId, status);
}

function isFailed(response, executionId) {
  var status = getStatus(response);
  if (status === 'failed') {
    throw new Error(message(executionId, 'failed'));
  }
  return false;
}

function isSucceeded(response, executionId) {
  var status = getStatus(response);
  return status === 'succeeded';
}

function isComplete(response, executionId) {
  return isSucceeded(response, executionId) ||
    isFailed(response, executionId);
}

function run(host, port, apiVersion, authToken, id, arguments) {
  return execute(host, port, apiVersion, authToken, id, arguments)
    .then(handleResponse);

  function handleResponse(response) {
    var executionId = getExecutionId(response);
    var status = getStatus(response);

    var loop = asyncWhile(
      (response) => { return !isComplete(response, executionId); },
      (response) =>
      {
        return P.delay(500)
          .then(() => {
            return getExecution(host, port, apiVersion, authToken, executionId)
          });
      }
    );

    return loop(response)
      .then(() => {
        console.log(message(executionId, 'succeeded'));
      })
      .catch((err) => {
        console.error(message(executionId, 'failed'));
        throw err;
      })
  }
}

module.exports = run;
