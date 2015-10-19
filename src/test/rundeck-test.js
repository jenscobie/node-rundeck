var assert = require('assert');
var fs = require('fs');
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
});
