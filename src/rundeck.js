exports = module.exports = Rundeck;

var request = require('request');
var async = require('async');
var xml2js = require('xml2js').parseString;
var run = require('./lib/job');

function Rundeck(options) {
  options = options || {};
  this.options = options;

  if (!options.host) { throw new Error('Required option host not set') }
  if (!options.port) { throw new Error('Required option port not set') }
  if (!options.apiVersion) { throw new Error('Required option apiVersion not set') }
  if (!options.authToken) { throw new Error('Required option authToken not set') }

  this.host(options.host);
  this.port(options.port);
  this.apiVersion(options.apiVersion || 13);
  this.authToken(options.authToken);
}

Rundeck.prototype.host = function(host) {
  if (host !== undefined) {
    this.options.host = host;
  }
  return this;
};

Rundeck.prototype.port = function(port) {
  if (port !== undefined) {
    this.options.port = port;
  }
  return this;
};

Rundeck.prototype.apiVersion = function(version) {
  if (version !== undefined) {
    this.options.apiVersion = version;
  }
  return this;
};

Rundeck.prototype.authToken = function(token) {
  if (token !== undefined) {
    this.options.authToken = token;
  }
  return this;
};

Rundeck.prototype.executeJob = function(id, arguments, done) {
  run(this.options.host,
    this.options.port,
    this.options.apiVersion,
    this.options.authToken,
    id,
    arguments,
    done);
  return this;
}
