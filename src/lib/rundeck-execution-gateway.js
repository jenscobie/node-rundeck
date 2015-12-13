var request = require('request');
var util = require('util');
var xml2js = require('xml2js').parseString;

function rootResource(host, port, apiVersion) {
  return util.format("%s:%s/api/%d", host, port, apiVersion);
}

function executionResource(host, port, apiVersion, id) {
  return util.format("%s/execution/%s",
    rootResource(host, port, apiVersion),
    id);
}

function outputResource(host, port, apiVersion, id) {
  return util.format("%s/output",
    executionResource(host, port, apiVersion, id));
}

function options(url, authToken) {
  return {
    url: url,
    headers: {
      'User-Agent': 'node-rundeck',
      'X-Rundeck-Auth-Token': authToken
    }
  };
};

function logFailedRequest(response) {
  var entry = util.format("GET %s returned %d %s",
    response.request.href,
    response.statusCode,
    response.statusMessage);
  console.error(entry);
}

function getStatus(response) {
  var execution = response.executions.execution[0]
  return execution.$.status;
}

function getExecution(host, port, apiVersion, authToken, id, callback) {
  var url = executionResource(host, port, apiVersion, id);
  request.get(options(url, authToken), function getResponse(err, response, body) {
    if (err) return callback(err);
    if (response.statusCode != 200) {
      logFailedRequest(response);
      callback(new Error(util.format("Failed to get execution '%s'", id)));
    } else {
      handleExecutionResponse(body, id, callback);
    }
  });
}

function handleExecutionResponse(body, id, callback) {
  xml2js(body, function(err, response) {
    if (err) return callback(err);
    if (getStatus(response) === 'failed') {
      return callback(new Error(util.format("Execution of job '%s' failed", id)));
    }
    if (getStatus(response) === 'succeeded') {
      console.log(util.format("Execution '%s' succeeded", id));
    }
    callback(null, response);
  });
}

function getOutput(host, port, apiVersion, authToken, id, callback) {
  var url = outputResource(host, port, apiVersion, id);
  request.get(options(url, authToken), function getResponse(err, response, body) {
    if (err) return callback(err);
    if (response.statusCode != 200) {
      logFailedRequest(response);
      callback(new Error(util.format("Failed to get output for execution '%s'", id)));
    } else {
      handleOutputResponse(body, callback);
    }
  });
}

function handleOutputResponse(body, callback) {
  xml2js(body, function(err, response) {
    if (err) return callback(err);
    logOutput(response);
    callback(null, response.output.entries[0]);
  });
}

function logOutput(response) {
  response.output.entries[0].entry.forEach(logEntry);
}

function logEntry(entry) {
  console.log(entry.$.log);
}

module.exports.getExecution = getExecution;
module.exports.getOutput = getOutput;
