var assert = require('assert');
var fs = require('fs');
var nock = require('nock');
var sinon = require('mocha-sinon');
var Rundeck = require('../rundeck');

describe('Rundeck', function () {
  describe('Initialization', function () {
    it('should throw an error when no options specified', function () {
      assert.throws(function () { new Rundeck(); }, /No options set/);
    });

    it('should throw an error when no serverUrl specified', function () {
      assert.throws(function () { new Rundeck({}); }, /Required option serverUrl not set/);
    });

    it('should throw an error when no apiVersion specified', function () {
      assert.throws(function () { new Rundeck({
        serverUrl: 'http://example.com'
      }); }, /Required option apiVersion not set/);
    });

    it('should throw an error when no authToken specified', function () {
      assert.throws(function () { new Rundeck({
        serverUrl: 'http://example.com',
        apiVersion: 13
      }); }, /Required option authToken not set/);
    });

    it('should succeed when all required options are specified', function () {
      var rundeck;
      assert.doesNotThrow(function () {
        rundeck = new Rundeck({
          serverUrl: 'http://example.com',
          apiVersion: 13,
          authToken: 'token'
        });
      });
      assert(rundeck.serverUrl, 'Missing rundeck.serverUrl object');
    });
  });

  describe('Job Execution', function () {

    beforeEach(function() {
      this.sinon.stub(console, 'log');
    });

    var requestHeaders = function() {
      return {
          reqheaders: {
            'User-Agent': 'node-rundeck',
            'X-Rundeck-Auth-Token': 'token'
          }
        }
    }

    it('should log the execute job GET request', function (done) {
      nock('http://localhost:4440', requestHeaders())
        .get('/api/13/job/1234/run')
        .reply(200, fs.readFileSync('./src/test/data/job-run.xml', 'ascii'));

      nock('http://localhost:4440', requestHeaders())
        .get('/api/13/execution/1')
        .reply(200, fs.readFileSync('./src/test/data/job-done.xml', 'ascii'));

      var rundeck = new Rundeck({
        serverUrl: 'http://localhost:4440',
        apiVersion: 13,
        authToken: 'token'
      });

      rundeck.executeJob('1234', done);

      assert(console.log.calledWith('GET: http://localhost:4440/api/13/job/1234/run'));
      done();
    });
  });
});
