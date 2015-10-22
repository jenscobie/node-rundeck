var chai = require("chai");
var expect = require("chai").expect;
var fs = require('fs');
var request = require('request');
var sinon = require('sinon');
var sinonChai = require("sinon-chai");
var util = require('util');
var get = require('../lib/rundeck-execution-gateway');
chai.use(sinonChai);

describe('Rundeck Execution Gateway', function () {
  describe('GET /api/13/execution/id', function () {

    var token = 'token';
    var id = 1;
    var payload = fs.readFileSync('./src/test/data/job-done.xml', 'ascii');
    var failedPayload = fs.readFileSync('./src/test/data/job-failed.xml', 'ascii');

    function stubSuccessfulRequest() {
      sinon
        .stub(request, 'get')
        .withArgs({
          url: util.format("http://example.com:4000/api/13/execution/%s", id),
          headers: {
            'User-Agent': 'node-rundeck',
            'X-Rundeck-Auth-Token': token
          }
        }, sinon.match.any)
        .yields(null,
          {
            statusCode: 200,
            statusMessage: 'OK',
            request: {
              href: 'http://example.com:4000/api/13/execution/1'
            }
          },
          payload);
    }

    function stubFailedRequest() {
      sinon
        .stub(request, 'get')
        .withArgs({
          url: util.format("http://example.com:4000/api/13/execution/%s", id),
          headers: {
            'User-Agent': 'node-rundeck',
            'X-Rundeck-Auth-Token': token
          }
        }, sinon.match.any)
        .yields(null,
          {
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            request: {
              href: 'http://example.com:4000/api/13/execution/1'
            }
          },
          null);
    }

    function stubFailedExecution() {
      sinon
        .stub(request, 'get')
        .withArgs({
          url: util.format("http://example.com:4000/api/13/execution/%s", id),
          headers: {
            'User-Agent': 'node-rundeck',
            'X-Rundeck-Auth-Token': token
          }
        }, sinon.match.any)
        .yields(null,
          {
            statusCode: 200,
            statusMessage: 'OK',
            request: {
              href: 'http://example.com:4000/api/13/execution/1'
            }
          },
          failedPayload);
    }

    it('should log error', function(done) {
      sinon.stub(console, 'error');
      stubFailedRequest();

      get('http://example.com', 4000, 13, token, id, function(err, result) {

        expect(console.error).to.have.been
          .calledWith("GET http://example.com:4000/api/13/execution/1 returned 500 Internal Server Error");

        request.get.restore();
        console.error.restore();
        done();
      });
    });

    it('should return json payload', function(done) {
      sinon.stub(console, 'log');
      stubSuccessfulRequest();

      get('http://example.com', 4000, 13, token, id, function (err, result) {
        expect(request.get).to.have.been.called;

        var execution = result.executions.execution[0];
        expect(execution.$.id).to.equal('1');
        expect(execution.$.href).to.equal('http://example.com:4000/execution/follow/1');
        expect(execution.$.status).to.equal('succeeded');

        request.get.restore();
        console.log.restore();
        done();
      });
    });

    it('should log task completion', function(done) {
      sinon.stub(console, 'log');
      stubSuccessfulRequest();

      get('http://example.com', 4000, 13, token, id, function(err, result) {

        expect(console.log).to.have.been
          .calledWith("Execution '1' succeeded");

        request.get.restore();
        console.log.restore();
        done();
      });
    });

    it('should return error on failure', function(done) {
      sinon.stub(console, 'error');
      stubFailedRequest();
      var spy = sinon.spy();

      get('http://example.com', 4000, 13, token, id, spy);
      expect(spy).to.have.been.calledWith(new Error("Failed to get execution '1'"));

      request.get.restore();
      console.error.restore();
      done();
    });

    it('should return error when task execution fails', function(done) {
      stubFailedExecution();
      var spy = sinon.spy();

      get('http://example.com', 4000, 13, token, id, spy);
      expect(spy).to.have.been.calledWith(new Error("Execution of job '1' failed"));

      request.get.restore();
      done();
    });
  });
});
