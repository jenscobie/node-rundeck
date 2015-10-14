var assert = require('assert');
var fs = require('fs');
var request = require('request');
var nodeunit = require('nodeunit');
var sinon = require('sinon');
var util = require('util');
var execute = require('../lib/rundeck-job-gateway');

describe('Rundeck Gateway', function () {
  describe('Rundeck API is available', function () {

    var token = 'token';
    var id = 1;
    var payload = fs.readFileSync('./src/test/data/job-run.xml', 'ascii');

    before(function(done) {
      sinon
        .stub(request, 'get')
        .withArgs({
          url: util.format("http://example.com:4000/api/13/job/%s/run", id),
          headers: {
            'User-Agent': 'node-rundeck',
            'X-Rundeck-Auth-Token': token
          }
        }, sinon.match.any)
        .yields(null,
          { statusCode: 200 },
          payload);
      done();
    });

    after(function(done) {
      request.get.restore();
      done();
    });

    it('should return json payload on job execution', function(done) {
      execute('http://example.com', 4000, 13, token, id, function (err, result) {
        assert(request.get.called);
        var execution = result.executions.execution[0];
        assert.equal(execution.$.id, 1);
        assert.equal(execution.$.href, 'http://example.com:4000/execution/follow/1');
        assert.equal(execution.$.status, 'running');
        done();
      });
    });
  });

  describe('Rundeck API is down', function () {

    var token = 'token';
    var id = 1;

    before(function(done) {
      sinon
        .stub(request, 'get')
        .withArgs({
          url: util.format("http://example.com:4000/api/13/job/%s/run", id),
          headers: {
            'User-Agent': 'node-rundeck',
            'X-Rundeck-Auth-Token': token
          }
        }, sinon.match.any)
        .yields(null,
          { statusCode: 200 },
          fs.readFileSync('./src/test/data/job-run.xml', 'ascii'));
      done();
    });

    after(function(done) {
      request.get.restore();
      done();
    });

    it('should return error on job execution failure', function(done) {
      execute('http://example.com', 4000, 13, token, id, function (err, result) {
        assert.ifError(err);
        done();
      });
    });
  })
});
