var P = require('bluebird');
var http = require('http-as-promised');
var query = require("querystring");
var util = require('util');
var xml2js = P.promisifyAll(require('xml2js'));

function executeJobUrl(host, port, apiVersion, id, arguments) {
  var queryString = query.stringify({argString: arguments});
  return util.format("%s:%s/api/%d/job/%s/run?%s",
    host, port, apiVersion, id, queryString);
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

function execute(host, port, apiVersion, authToken, id, arguments) {
  var url = executeJobUrl(host, port, apiVersion, id, arguments)
  return http
    .post(options(url, authToken))
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

module.exports = execute;
