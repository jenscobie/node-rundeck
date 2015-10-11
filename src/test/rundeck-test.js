var assert = require('assert');
var fs = require('fs');
var nock = require('nock');
var sinon = require('sinon');
var Rundeck = require('../rundeck');

describe('Rundeck', function () {
  describe('Initialization', function () {
    it('should throw an error when no host specified', function () {
      assert.throws(function () { new Rundeck({}); }, /Required option host not set/);
    });

    it('should throw an error when no port specified', function () {
      assert.throws(function () { new Rundeck({
        host: 'http://example.com'
      }); }, /Required option port not set/);
    });

    it('should throw an error when no apiVersion specified', function () {
      assert.throws(function () { new Rundeck({
        host: 'http://example.com',
        port: 4000
      }); }, /Required option apiVersion not set/);
    });

    it('should throw an error when no authToken specified', function () {
      assert.throws(function () { new Rundeck({
        host: 'http://example.com',
        port: 4000,
        apiVersion: 13
      }); }, /Required option authToken not set/);
    });

    it('should succeed when all required options are specified', function () {
      var rundeck;
      assert.doesNotThrow(function () {
        rundeck = new Rundeck({
          host: 'http://example.com',
          port: 4000,
          apiVersion: 13,
          authToken: 'token'
        });
      });
      assert(rundeck.host, 'Missing rundeck.host object');
    });
  });

  describe('Job Execution', function () {
    var sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
      sandbox.restore();
    })

    var requestHeaders = function() {
      return {
          reqheaders: {
            'User-Agent': 'node-rundeck',
            'X-Rundeck-Auth-Token': 'token'
          }
        }
    }

    it('should log the execute job GET request', function (done) {
      sandbox.stub(console, 'log');

      nock('http://example.com:4000', requestHeaders())
        .get('/api/13/job/1234/run')
        .reply(200, fs.readFileSync('./src/test/data/job-run.xml', 'ascii'));

      nock('http://example.com:4000', requestHeaders())
        .get('/api/13/execution/1')
        .reply(200, fs.readFileSync('./src/test/data/job-done.xml', 'ascii'));

      var rundeck = new Rundeck({
        host: 'http://example.com',
        port: 4000,
        apiVersion: 13,
        authToken: 'token'
      });

      rundeck.executeJob('1234', done);

      assert(console.log.calledWith('GET: http://example.com:4000/api/13/job/1234/run'));
      assert(console.log.calledWith('GET: http://example.com:4000/api/13/execution/1'));
    });
  });
});
