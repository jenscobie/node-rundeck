var async = require('async');
var request = require('request');
var util = require('util');
var xml2js = require('xml2js').parseString;
var execute = require('../lib/rundeck-job-gateway');
var get = require('../lib/rundeck-execution-gateway');

function run(host, port, apiVersion, authToken, id, done) {

  function getExecutionId(response) {
    var execution = response.executions.execution[0]
    return execution.$.id;
  }

  function getStatus(response) {
    var execution = response.executions.execution[0]
    return execution.$.status;
  }

  function pollExecutionStatus(executionId, callback) {
    get(host, port, apiVersion, authToken, executionId, function(err, response) {
      if (err) return callback(err);
      callback(null, response);
    });
  }

  execute(host, port, apiVersion, authToken, id, function(err, response) {
    if (err) return done(err);

    var executionId = getExecutionId(response);
    var status = getStatus(response);

    async.until(function() {
      return status === 'succeeded';
    },
    function(next) {
      pollExecutionStatus(executionId, function(err, response) {
        if (err) return done(err);
        status = getStatus(response);
        setTimeout(next, 100);
      });
    },
    function(err) {
      return done(err);
    });
  });
}

module.exports = run;
