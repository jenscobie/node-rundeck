var P = require('bluebird');
var http = require('http-as-promised');
var util = require('util');
var xml2js = P.promisifyAll(require('xml2js'));

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
    },
    resolve: 'body'
  };
};

function getExecution(host, port, apiVersion, authToken, id) {
  var url = executionResource(host, port, apiVersion, id);
  return http
    .get(options(url, authToken))
    .then(handleExecutionResponse)
    .catch(logFailedRequest);
}

function handleExecutionResponse(body) {
  return xml2js.parseStringAsync(body);
}

function logFailedRequest(err) {
  var error = util.format("%s %s returned %s",
    err.options.method,
    err.options.url,
    err.message);
  console.error(error);
  console.error(err.body);
  throw new Error(error);
}

function getOutput(host, port, apiVersion, authToken, executionId) {
  var url = outputResource(host, port, apiVersion, executionId);
  return http(options(url, authToken))
    .then(handleOutputResponse)
    .catch(logFailedRequest);
}

function handleOutputResponse(body) {
  return xml2js.parseStringAsync(body)
    .then(logJobOutput);
}

function logJobOutput(body) {
  body.output.entries[0].entry.forEach(logEntry);
  return body.output.entries[0];
}

function logEntry(entry) {
  console.log(entry.$.log);
}

module.exports.getExecution = getExecution;
module.exports.getOutput = getOutput;
