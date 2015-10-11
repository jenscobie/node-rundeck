exports = module.exports = Rundeck;

var request = require('request');
var async = require('async');
var xml2js = require('xml2js').parseString;
var Job = require('./lib/job');

function Rundeck(options) {
  if (!options) { throw new Error('No options set'); }
  if (!options.serverUrl) { throw new Error('Required option serverUrl not set') }
  if (!options.apiVersion) { throw new Error('Required option apiVersion not set') }
  if (!options.authToken) { throw new Error('Required option authToken not set') }

  this.serverUrl = options.serverUrl;
  this.apiVersion = options.apiVersion;
  this.authToken = options.authToken;
}

Rundeck.prototype.executeJob = function(jobId, done) {
  var job = new Job(this.serverUrl, this.apiVersion, this.authToken, jobId);
  job.execute(done);
}
