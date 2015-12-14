var P = require('bluebird');
var chai = require('chai');
var expect = require('chai').expect;
var fs = require('fs');
var nock = require('nock');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var run = require('../lib/job');
chai.use(sinonChai);

describe('Runeck Job', function () {

  afterEach(function() {
    nock.cleanAll();
  });

  describe('run', function () {

    var token = 'token';
    var id = 1;
    var payload = fs.readFileSync('./src/test/data/job-done.xml', 'ascii');
    var runPayload = fs.readFileSync('./src/test/data/job-run.xml', 'ascii');
    var failedPayload = fs.readFileSync('./src/test/data/job-failed.xml', 'ascii');
    var runResource = '/api/13/job/1/run?argString=-argument%20value';
    var error = 'GET http://example.com:4000/api/13/execution/1 returned 500 Internal Server Error';

    it('should log on job failure', function(done) {
      sinon.stub(console, 'error');

      nock('http://example.com:4000')
        .post(runResource)
        .reply(200, failedPayload);

      nock('http://example.com:4000')
        .get('/api/13/execution/1')
        .reply(200, failedPayload);

      run('http://example.com', 4000, 13, token, id, '-argument value')
        .catch((err) => {
          expect(console.error).to.have.been.calledWith("Execution of job '1' failed");

          console.error.restore();
          done();
        });
    });

    it('should return error on job failure', function(done) {
      sinon.stub(console, 'error');

      nock('http://example.com:4000')
        .post(runResource)
        .reply(200, failedPayload);

      nock('http://example.com:4000')
        .get('/api/13/execution/1')
        .reply(200, failedPayload);

      run('http://example.com', 4000, 13, token, id, '-argument value')
        .catch((err) => {
          expect(err.message).to.equal("Execution of job '1' failed");

          console.error.restore();
          done();
        });
    });

    it('should log on job completion', function(done) {
      sinon.stub(console, 'log');

      nock('http://example.com:4000')
        .post(runResource)
        .reply(200, runPayload);

      nock('http://example.com:4000')
        .get('/api/13/execution/1')
        .reply(200, payload);

      run('http://example.com', 4000, 13, token, id, '-argument value')
        .then(() => {
          expect(console.log).to.have.been.calledWith("Execution of job '1' succeeded");

          console.log.restore();
          done();
        });
    });
  });
});
