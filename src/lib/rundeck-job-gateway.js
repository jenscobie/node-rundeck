var request = require('request');
var util = require('util');
var xml2js = require('xml2js').parseString;

function executeJobUrl(host, port, apiVersion, id) {
  return util.format("%s:%s/api/%d/job/%s/run", host, port, apiVersion, id);
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
  console.log(entry);
}

function execute(host, port, apiVersion, authToken, id, callback) {
  var url = executeJobUrl(host, port, apiVersion, id)
  request.get(options(url, authToken), function getResponse(err, response, body) {
    if (err) return callback(err);
    logResponse(response);
    if (response.statusCode != 200) {
      callback(new Error(util.format("Failed to execute job '%s'", id)));
    } else {
      xml2js(body, function(err, response) {
        callback(null, response);
      });
    }
  });
}

module.exports = execute;
