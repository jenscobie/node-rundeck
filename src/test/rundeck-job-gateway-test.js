var P = require('bluebird');
var chai = require('chai');
var expect = require('chai').expect;
var fs = require('fs');
var nock = require('nock');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var util = require('util');
var execute = require('../lib/rundeck-job-gateway');
chai.use(sinonChai);

describe('Rundeck Job Gateway', function () {
  describe('POST /api/13/job/id/run', function () {

    var token = 'token';
    var id = 1;
    var payload = fs.readFileSync('./src/test/data/job-run.xml', 'ascii');
    var badRequestPayload = fs.readFileSync('./src/test/data/job-error.xml', 'ascii');

    function error(code, message) {
      return util.format("POST http://example.com:4000/api/13/job/1/run?argString=-argument%20value returned %d %s",
        code,
        message);
    }

    it('should log on HTTP failure', function(done) {
      sinon.stub(console, 'error');

      nock('http://example.com:4000')
        .post('/api/13/job/1/run?argString=-argument%20value')
        .reply(500);

      execute('http://example.com', 4000, 13, token, id, '-argument value')
        .catch(function(err) {
          expect(console.error).to.have.been.calledWith(error(500, 'Internal Server Error'));
          
          console.error.restore();
          done();
        });
    });

    it('should return error on HTTP failure', function(done) {
      sinon.stub(console, 'error');

      nock('http://example.com:4000')
        .post('/api/13/job/1/run?argString=-argument%20value')
        .reply(500);

      execute('http://example.com', 4000, 13, token, id, '-argument value')
        .catch(function(err) {
          expect(err.message).to.equal(error(500, 'Internal Server Error'));

          console.error.restore();
          done();
        });
    });

    it('should return error when client sends a bad request', function(done) {
      sinon.stub(console, 'error');
      sinon.stub(console, 'log');

      nock('http://example.com:4000')
        .post('/api/13/job/1/run?argString=-argument%20value')
        .reply(400, badRequestPayload);

      execute('http://example.com', 4000, 13, token, id, '-argument value')
        .catch(function(err) {
          expect(err.message).to.equal(error(400, 'Bad Request'));

          console.error.restore();
          console.log.restore();
          done();
        });
    });

    it('should return JSON payload', function(done) {
      sinon.stub(console, 'log');

      nock('http://example.com:4000')
        .post('/api/13/job/1/run?argString=-argument%20value')
        .reply(200, payload);

      execute('http://example.com', 4000, 13, token, id, '-argument value')
        .then((response) => {
          var execution = response.executions.execution[0];
          expect(execution.$.id).to.equal('1');
          expect(execution.$.href).to.equal('http://example.com:4000/execution/follow/1');
          expect(execution.$.status).to.equal('running');
          expect(execution.argstring[0]).to.equal('-argument value');

          console.log.restore();
          done();
        });
    });
  });
});
