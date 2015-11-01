var chai = require("chai");
var expect = require("chai").expect;
var fs = require('fs');
var request = require('request');
var sinon = require('sinon');
var sinonChai = require("sinon-chai");
var util = require('util');
var execute = require('../lib/rundeck-job-gateway');
chai.use(sinonChai);

describe('Rundeck Job Gateway', function () {
  describe('POST /api/13/job/id/run', function () {

    var token = 'token';
    var id = 1;
    var payload = fs.readFileSync('./src/test/data/job-run.xml', 'ascii');
    var badRequestPayload = fs.readFileSync('./src/test/data/job-error.xml', 'ascii');

    function stubSuccessfulRequest() {
      sinon
        .stub(request, 'post')
        .withArgs({
          url: util.format("http://example.com:4000/api/13/job/%s/run", id),
          headers: {
            'User-Agent': 'node-rundeck',
            'X-Rundeck-Auth-Token': token
          },
          body: JSON.stringify({
            'argString': '-argument value'
          })
        }, sinon.match.any)
        .yields(null,
          {
            statusCode: 200,
            statusMessage: 'OK',
            request: {
              href: 'http://example.com:4000/api/13/job/1/run'
            }
          },
          payload);
    }

    function stubFailedRequest() {
      sinon
        .stub(request, 'post')
        .withArgs(sinon.match.any, sinon.match.any)
        .yields(new Error('Something bad happened'), null, null);
    }

    function stubFailedResponse() {
      sinon
        .stub(request, 'post')
        .withArgs({
          url: util.format("http://example.com:4000/api/13/job/%s/run", id),
          headers: {
            'User-Agent': 'node-rundeck',
            'X-Rundeck-Auth-Token': token
          },
          body: JSON.stringify({
            'argString': '-argument value'
          })
        }, sinon.match.any)
        .yields(null,
          {
            statusCode: 400,
            statusMessage: 'Bad Request',
            request: {
              href: 'http://example.com:4000/api/13/job/1/run'
            }
          },
          badRequestPayload);
    }

    it('should log error if request failed', function(done) {
      sinon.stub(console, 'error');
      stubFailedRequest();
      var spy = sinon.spy();

      var message = 'Something bad happened';
      execute('http://example.com', 4000, 13, token, id, '', spy);
      expect(console.error).to.have.been.calledWith(message);
      expect(spy).to.have.been.calledWith(new Error(message));

      request.post.restore();
      console.error.restore();
      done();
    });

    it('should log response', function(done) {
      sinon.stub(console, 'log');
      stubSuccessfulRequest();

      execute('http://example.com', 4000, 13, token, id, '-argument value', function(err, result) {
        expect(console.log).to.have.been
          .calledWith('POST http://example.com:4000/api/13/job/1/run returned 200 OK');

        request.post.restore();
        console.log.restore();
        done();
      });
    });

    it('should return json payload', function(done) {
      sinon.stub(console, 'log');
      stubSuccessfulRequest();

      execute('http://example.com', 4000, 13, token, id, '-argument value', function (err, result) {
        expect(request.post).to.have.been.called;

        var execution = result.executions.execution[0];
        expect(execution.$.id).to.equal('1');
        expect(execution.$.href).to.equal('http://example.com:4000/execution/follow/1');
        expect(execution.$.status).to.equal('running');
        expect(execution.argstring[0]).to.equal('-argument value');

        request.post.restore();
        console.log.restore();
        done();
      });
    });

    it('should return error when client sends a bad request', function(done) {
      sinon.stub(console, 'error');
      sinon.stub(console, 'log');
      stubFailedResponse();
      var spy = sinon.spy();

      var message = "Execution '1' failed. Job options were not valid: Option 'argument' is required.";
      execute('http://example.com', 4000, 13, token, id, '-argument value', spy);
      expect(console.error).to.have.been.calledWith(message);
      expect(spy).to.have.been.calledWith(new Error(message));

      request.post.restore();
      console.error.restore();
      console.log.restore();
      done();
    });
  });
});
