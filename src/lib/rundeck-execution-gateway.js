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
    response.href,
    response.statusCode,
    response.statusMessage);
  console.error(entry);
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
        callback(null, response);
      });
    }
  });
}

module.exports = get;
