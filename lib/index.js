'use strict';

var ProfilesService = require('ibm-connections-profiles-service');

var profiles;

exports.setup = function (baseUrl, options) {
  options = options || {};
  profiles = new ProfilesService(baseUrl, options);
  return profiles;
};

exports.getService = function getProfilesService() {
  if (!profiles) {
    console.error('ProfilesService has not been set-up yet.');
    process.exit(1);
  }
  return profiles;
};
