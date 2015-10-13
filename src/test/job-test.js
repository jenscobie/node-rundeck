var assert = require('assert');
var Job = require('../lib/job');

describe('Job', function () {
  describe('Initialization', function () {
    it('should succeed', function () {
      var job;
      assert.doesNotThrow(function () {
        job = new Job('http://example.com', 13, 'token', 'id');
      });
      assert(job.serverUrl, 'Missing job.serverUrl object');
      assert(job.apiVersion, 'Missing job.apiVersion object');
      assert(job.authToken, 'Missing job.authToken object');
      assert(job.id, 'Missing job.id object');
    });
  });
});
