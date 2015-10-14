var assert = require('assert');
var fs = require('fs');
var request = require('request');
var sinon = require('sinon');
var util = require('util');
var execute = require('../lib/rundeck-job-gateway');

describe('Rundeck Gateway', function () {
  describe('Execute Job', function () {

    var token = 'token';
    var id = 1;

    before(function(done) {
      sinon
        .stub(request, 'get')
        .withArgs({
          url: util.format("http://example.com:4000/api/13/job/%s/run", id),
          headers: {
            'User-Agent': 'node-rundeck',
            'X-Rundeck-Auth-Token': token
          }
        }, sinon.match.any)
        .yields(null, fs.readFileSync('./src/test/data/job-run.xml', 'ascii'));
      done();
    });

    it('should GET /job/id/run resource', function(done) {
      execute('http://example.com', 4000, 13, token, id, function (err, result) {
        assert(request.get.called);
        done();
      });
    });
  })
});
