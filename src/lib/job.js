var async = require('async');
var request = require('request');
var util = require('util');
var xml2js = require('xml2js').parseString;

exports = module.exports = Job;

function Job(serverUrl, apiVersion, authToken, id) {
  this.serverUrl = serverUrl
  this.apiVersion = apiVersion
  this.authToken = authToken
  this.id = id
}

Job.prototype.execute = function(done) {

  var get = function(url, authToken, done) {
    var options = {
      url: url,
      headers: {
        'User-Agent': 'node-rundeck',
        'X-Rundeck-Auth-Token': authToken
      }
    };

    request(options, function (err, response, body) {
      if(err) {
        return done(err);
      }

      var statusCode = response && response.statusCode;

      if(statusCode !== 200) {
        return done(new Error('status code was: ' + response.statusCode + ' => ' + body));
      }

      if(!body) {
        return done(new Error("got an empty response from rundeck api"));
      }

      xml2js(body, function(err, response) {
        done(null, response);
      });
    });
  };

  var runJob = function(serverUrl, apiVersion, authToken, id, done) {
    var url = function(serverUrl, apiVersion, id) {
      return util.format("%s/api/%d/job/%s/run", serverUrl, apiVersion, id);
    };

    var executeJobUrl = url(serverUrl, apiVersion, id);
    console.log('GET: ' + executeJobUrl);
    get(executeJobUrl, authToken, function(err, body) {
      if(err) {
        return done(err);
      }

      var executionInfo = body.executions.execution[0];
      return done(null, executionInfo, serverUrl, apiVersion, authToken);
    });
  };

  var pollResults = function(serverUrl, apiVersion, authToken, executionId, done) {
    var url = function(serverUrl, apiVersion, executionId) {
      return util.format("%s/api/%d/execution/%s", serverUrl, apiVersion, executionId);
    };

    var executionStatusUrl = url(serverUrl, apiVersion, executionId);
    get(executionStatusUrl, authToken, function(err, body) {
      if(err) {
        return done(err);
      }

      var executionInfo = body.executions.execution[0];

      if(executionInfo.$.status === "failed") {
        var message = util.format("Execution failed: %s", executionInfo.$.href);
        console.log(message);
        console.log(JSON.stringify(executionInfo));
        return done(new Error(message));
      }

      return done(null, executionInfo);
    });
  };

  runJob(this.serverUrl, this.apiVersion, this.authToken, this.id,
    function(err, execution, serverUrl, apiVersion, authToken) {
      if (err) {
        return done(err);
      }

      var status = execution.$.status;
      var executionId = execution.$.id;

      async.until(function() {
        return status === "succeeded";
      },
      function(next) {
        pollResults(serverUrl, apiVersion, authToken, executionId, function(err, response) {
          if(err) {
            return done(err);
          }

          status = response.$.status;
          setTimeout(next, 10000);
        });
      },
      function(err) {
        return done(err);
      });
  });
};
