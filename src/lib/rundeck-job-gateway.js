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

function execute(host, port, apiVersion, authToken, id, callback) {
  var url = executeJobUrl(host, port, apiVersion, id)
  request.get(options(url, authToken), function(err, response, body) {
    if (err) return callback(err);
    if (response.statusCode != 200) {
      var message = util.format("Failed to execute job '%s'", id);
      console.error(util.format("GET %s returned %d",
        executeJobUrl(host, port, apiVersion, id), response.statusCode));
      callback(new Error(message));
    } else {
      console.log(util.format("GET %s returned 200 OK",
        executeJobUrl(host, port, apiVersion, id)));
      xml2js(body, function(err, response) {
        callback(null, response);
      });
    }
  });
}

module.exports = execute;
