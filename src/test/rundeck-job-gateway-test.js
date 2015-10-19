var chai = require("chai");
var expect = require("chai").expect;
var fs = require('fs');
var request = require('request');
var sinon = require('sinon');
var sinonChai = require("sinon-chai");
var util = require('util');
var execute = require('../lib/rundeck-job-gateway');
chai.use(sinonChai);

describe('Rundeck Gateway', function () {
  describe('GET /api/13/job/id/run', function () {

    var token = 'token';
    var id = 1;
    var payload = fs.readFileSync('./src/test/data/job-run.xml', 'ascii');

    function stubSuccessfulRequest() {
      sinon.stub(console, 'log');
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
          {
            statusCode: 200,
            statusMessage: 'OK',
            href: 'http://example.com:4000/api/13/job/1/run'
          },
          payload);
    }

    function stubFailedRequest() {
      sinon.stub(console, 'log');
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
          {
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            href: 'http://example.com:4000/api/13/job/1/run'
          },
          null);
    }

    it('should log response', function(done) {
      stubSuccessfulRequest();
      execute('http://example.com', 4000, 13, token, id, function(err, result) {

        expect(console.log).to.have.been
          .calledWith("GET http://example.com:4000/api/13/job/1/run returned 200 OK");

        request.get.restore();
        console.log.restore();
        done();
      });
    });

    it('should return json payload', function(done) {
      stubSuccessfulRequest();
      execute('http://example.com', 4000, 13, token, id, function (err, result) {
        expect(request.get).to.have.been.called;

        var execution = result.executions.execution[0];
        expect(execution.$.id).to.equal('1');
        expect(execution.$.href).to.equal('http://example.com:4000/execution/follow/1');
        expect(execution.$.status).to.equal('running');

        request.get.restore();
        console.log.restore();
        done();
      });
    });

    it('should return error on failure', function(done) {
      stubFailedRequest();
      var spy = sinon.spy();

      execute('http://example.com', 4000, 13, token, id, spy);
      expect(spy).to.have.been.calledWith(new Error("Failed to execute job '1'"));

      request.get.restore();
      console.log.restore();
      done();
    });
  });
});
