var P = require('bluebird');
var chai = require('chai');
var expect = require('chai').expect;
var fs = require('fs');
var nock = require('nock');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var getExecution = require('../lib/rundeck-execution-gateway').getExecution;
var getOutput = require('../lib/rundeck-execution-gateway').getOutput;
chai.use(sinonChai);

describe('Rundeck Execution Gateway', function () {
  describe('GET /api/13/execution/id', function () {

    var token = 'token';
    var id = 1;
    var payload = fs.readFileSync('./src/test/data/job-done.xml', 'ascii');
    var outputPayload = fs.readFileSync('./src/test/data/job-output.xml', 'ascii');
    var failedPayload = fs.readFileSync('./src/test/data/job-failed.xml', 'ascii');
    var error = 'GET http://example.com:4000/api/13/execution/1 returned 500 Internal Server Error';

    it('should log on HTTP failure', function(done) {
      sinon.stub(console, 'error');

      nock('http://example.com:4000')
        .get('/api/13/execution/1')
        .reply(500);

      getExecution('http://example.com', 4000, 13, token, id)
        .catch(function(err) {
          expect(console.error).to.have.been.calledWith(error);

          console.error.restore();
          done();
        });
    });

    it('should return error on HTTP failure', function(done) {
      sinon.stub(console, 'error');

      nock('http://example.com:4000')
        .get('/api/13/execution/1')
        .reply(500);

      getExecution('http://example.com', 4000, 13, token, id)
        .catch(function(err) {
          expect(err.message).to.equal(error);

          console.error.restore();
          done();
        });
    });

    it('should return JSON payload', function(done) {
      sinon.stub(console, 'log');

      nock('http://example.com:4000')
        .get('/api/13/execution/1')
        .reply(200, payload);

      getExecution('http://example.com', 4000, 13, token, id)
        .then((response) => {
          var execution = response.executions.execution[0];
          expect(execution.$.id).to.equal('1');
          expect(execution.$.href).to.equal('http://example.com:4000/execution/follow/1');
          expect(execution.$.status).to.equal('succeeded');

          console.log.restore();
          done();
        });
    });
  });

  describe('GET /api/13/execution/id/output', function () {
    var token = 'token';
    var id = 1;
    var payload = fs.readFileSync('./src/test/data/job-output.xml', 'ascii');
    var error = 'GET http://example.com:4000/api/13/execution/1/output returned 500 Internal Server Error';

    it('should log on HTTP failure', function(done) {
      sinon.stub(console, 'error');

      nock('http://example.com:4000')
        .get('/api/13/execution/1/output')
        .reply(500);

      getOutput('http://example.com', 4000, 13, token, id)
        .catch(function(err) {
          expect(console.error).to.have.been.calledWith(error);

          console.error.restore();
          done();
        });
    });

    it('should return JSON payload', function(done) {
      sinon.stub(console, 'log');

      nock('http://example.com:4000')
        .get('/api/13/execution/1/output')
        .reply(200, payload);

      getOutput('http://example.com', 4000, 13, token, id)
        .then((response) => {
          expect(response.entry[0].$.log).to.equal('something happened');
          expect(response.entry[1].$.log).to.equal('something else happened');
          expect(response.entry[2].$.log).to.equal('another thing happened');

          console.log.restore();
          done();
        });
    });
  });
});
