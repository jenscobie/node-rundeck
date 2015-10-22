var request = require('request');
var util = require('util');
var xml2js = require('xml2js').parseString;

function executionUrl(host, port, apiVersion, id) {
  return util.format("%s:%s/api/%d/execution/%s", host, port, apiVersion, id);
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

function logResponse(response) {
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

function get(host, port, apiVersion, authToken, id, callback) {
  var url = executionUrl(host, port, apiVersion, id)
  request.get(options(url, authToken), function getResponse(err, response, body) {
    if (err) return callback(err);
    if (response.statusCode != 200) {
      logResponse(response);
      callback(new Error(util.format("Failed to get execution '%s'", id)));
    } else {
      xml2js(body, function(err, response) {
        if (getStatus(response) === 'failed') {
          return callback(new Error(util.format("Execution of job '%s' failed", id)));
        }
        if (getStatus(response) === 'succeeded') {
          console.log(util.format("Execution '%s' succeeded", id));
        }
        callback(null, response);
      });
    }
  });
}

module.exports = get;
