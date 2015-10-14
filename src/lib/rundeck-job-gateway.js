var request = require('request');
var util = require('util');

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
    callback(null, body);
  });
}

module.exports = execute;
