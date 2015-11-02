var request = require('request');
var query = require("querystring");
var util = require('util');
var xml2js = require('xml2js').parseString;

function executeJobUrl(host, port, apiVersion, id, arguments) {
  var queryString = query.stringify({argString: arguments});
  return util.format("%s:%s/api/%d/job/%s/run?%s",
    host, port, apiVersion, id, queryString);
}

function optionsWith(url, authToken) {
  return {
    url: url,
    headers: {
      'User-Agent': 'node-rundeck',
      'X-Rundeck-Auth-Token': authToken
    }
  };
};

function execute(host, port, apiVersion, authToken, id, arguments, callback) {
  var url = executeJobUrl(host, port, apiVersion, id, arguments)
  var options = optionsWith(url, authToken);
  request.post(options, function getResponse(err, response, body) {
    if (err) {
      console.error(err.message);
      return callback(err);
    }
    logResponse(response);
    if (response.statusCode != 200) {
      callback(new Error(processErrors(response, body, id)));
    } else {
      xml2js(body, function(err, response) {
        callback(null, response);
      });
    }
  });
}

function logResponse(response) {
  var entry = util.format("POST %s returned %d %s",
    response.request.href,
    response.statusCode,
    response.statusMessage);
  console.log(entry);
}

function processErrors(response, body, id) {
  xml2js(body, function(err, response) {
    var message = util.format("Job '%s' failed. %s", id, errorMessage(response));
    console.error(message);
    return message;
  });
}

function errorMessage(response) {
  return response.result.error[0].message[0];
}

module.exports = execute;
