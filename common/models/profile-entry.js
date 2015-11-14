'use strict';
var _ = require('lodash');

var ProfilesService = require('ibm-connections-profiles-service');

var profiles = new ProfilesService('https://w3-connections.ibm.com/profiles', {
  requestOptions: {
    headers: {
      'user-agent': 'Mozilla/5.0'
    },
    auth: {
      username: 'benjamin.kroeger@de.ibm.com',
      password: process.env.password
    }
  }
});

// @TODO: rename id property to userid
module.exports = function (ProfileEntryModel) {
  ProfileEntryModel.on('dataSourceAttached', function () {
    // mock the findById with an simple hash for the userid
    // @TODO: figure out how to get the context object into this method and make a real call to the backend
    ProfileEntryModel.findById = function (userid, callback) {
      callback(null, {
        userid: userid
      });
    };

    ProfileEntryModel.find = function (context, query, callback) {
      callback(null, 'OK');
    };

    ProfileEntryModel.prototype.getServiceDocument = function (context, callback) {
      var instance = context.instance;

      profiles.getServiceDocument({
        userid: instance.userid
      }).done(function (entry) {
        return callback(null, entry);
      }, function (reason) {
        return callback(reason);
      });
    };

    ProfileEntryModel.prototype.getEditableFields = function (context, callback) {
      var instance = context.instance;

      profiles.getEditableFields({
        userid: instance.userid
      }).done(function (entry) {
        return callback(null, entry);
      }, function (reason) {
        return callback(reason);
      });
    };

    ProfileEntryModel.getEntry = function (context, userid, callback) {
      if (!userid) {
        return callback(new Error('"userid" must be provided'), null);
      }
      return profiles.getEntry({
        userid: userid
      }).done(function (entry) {
        return callback(null, entry);
      }, function (reason) {
        return callback(reason);
      });
    };

    ProfileEntryModel.updateEntry = function (userid, entry, callback) {
      profiles.updateEntry({
        entry: _.merge(entry, {
          userid: userid
        })
      }).done(function () {
        callback(null, 'OK');
      }, function (reason) {
        return callback(reason);
      });
    };

    ProfileEntryModel.getTags = function (context, userid, contributor, callback) {
      profiles.getTags({
        targetUserid: userid,
        format: 'full'
      }).done(function (entry) {
        return callback(null, entry);
      }, function (reason) {
        return callback(reason);
      });
    };

    ProfileEntryModel.checkNetworkState = function (context, userid, callback) {
      callback(null, 'OK');
    };
    ProfileEntryModel.getNetwork = function (context, userid, callback) {
      callback(null, 'OK');
    };
    ProfileEntryModel.inviteToNetwork = function (context, userid, callback) {
      callback(null, 'OK');
    };
    ProfileEntryModel.removeFromNetwork = function (context, userid, callback) {
      callback(null, 'OK');
    };

    ProfileEntryModel.checkFollowState = function (context, userid, callback) {
      callback(null, 'OK');
    };
    ProfileEntryModel.prototype.getFollowedProfiles = function (context, callback) {
      callback(null, 'OK');
    };
    ProfileEntryModel.prototype.follow = function (context, callback) {
      callback(null, 'OK');
    };
    ProfileEntryModel.prototype.unfollow = function (context, callback) {
      callback(null, 'OK');
    };

    // service document
    ProfileEntryModel.remoteMethod(
      'getServiceDocument', {
        accepts: [{
          arg: 'context',
          type: 'object',
          http: {
            source: 'context'
          }
        }],
        returns: {
          root: true,
          type: 'object'
        },
        http: {
          verb: 'get',
          path: '/service-document'
        },
        isStatic: false,
        description: 'Get the Profile\'s service document',
        notes: ''
      });

    // editable fields
    ProfileEntryModel.remoteMethod(
      'getEditableFields', {
        accepts: [{
          arg: 'context',
          type: 'object',
          http: {
            source: 'context'
          }
        }],
        returns: {
          root: true,
          type: ['string']
        },
        http: {
          verb: 'get',
          path: '/editable-fields'
        },
        isStatic: false,
        description: 'Get the Profile\'s editable fields',
        notes: ''
      });

    ProfileEntryModel.remoteMethod(
      'find', {
        accepts: [{
          arg: 'context',
          type: 'object',
          http: {
            source: 'context'
          }
        }, {
          arg: 'query',
          type: 'object',
          required: true,
          http: function (ctx) {
            // ctx is LoopBack Context object

            // 1. Get the HTTP request object as provided by Express
            var req = ctx.req;

            // 2. Get 'a' and 'b' from query string or form data and return their sum.
            return _.merge(
              _.pick(req.query, [
                'page',
                'ps',
                'activeUsersOnly',
                'city',
                'country',
                'email',
                'jobTitle',
                'name',
                'organization',
                'phoneNumber',
                'profileTags',
                'profileType',
                'search',
                'state',
                'userid'
              ]), {
                format: 'full'
              });
          },
          description: 'The desired Profile Entry\'s userid property'
        }],
        returns: {
          root: true,
          type: ['ProfileEntry']
        },
        http: {
          verb: 'get',
          path: '/'
        },
        isStatic: true,
        description: 'Find profile entries matching provided query parameters',
        notes: ''
      });

    // entry
    ProfileEntryModel.remoteMethod(
      'getEntry', {
        accepts: [{
          arg: 'context',
          type: 'object',
          http: {
            source: 'context'
          }
        }, {
          arg: 'userid',
          type: 'string',
          required: true,
          http: {
            source: 'path'
          },
          description: 'The desired Profile Entry\'s userid property'
        }],
        returns: {
          root: true,
          type: 'ProfileEntry'
        },
        http: {
          verb: 'get',
          path: '/:userid'
        },
        isStatic: true,
        description: 'retrieves profile entry by provided "userid" parameter',
        notes: ''
      });

    ProfileEntryModel.remoteMethod(
      'updateEntry', {
        accepts: [{
          arg: 'userid',
          type: 'string',
          required: true,
          http: {
            source: 'path'
          },
          description: 'The desired Profile Entry\'s userid property'
        }, {
          arg: 'entry',
          type: 'ProfileEntry',
          required: true,
          http: {
            source: 'body'
          },
          description: 'Hash of all properties that are to be updated for this entry'
        }],
        returns: [{
          arg: 'result',
          type: 'string'
        }],
        http: {
          verb: 'put',
          path: '/:userid',
          status: 201
        },
        isStatic: true,
        description: 'updates profile entry with provided properties',
        notes: ''
      });

    // tags
    ProfileEntryModel.remoteMethod(
      'getTags', {
        accepts: [{
          arg: 'context',
          type: 'object',
          http: {
            source: 'context'
          }
        }, {
          arg: 'contributor',
          type: 'string',
          http: {
            source: 'query'
          },
          description: '`userid` of a profile that applied tags to this instance'
        }],
        returns: {
          root: true,
          type: 'ProfileTags'
        },
        http: {
          verb: 'get',
          path: '/tags'
        },
        isStatic: false,
        description: 'retrieves tags applied to the selected profile',
        notes: ''
      });

    // network
    ProfileEntryModel.remoteMethod(
      'checkNetworkState', {
        accepts: [{
          arg: 'context',
          type: 'object',
          http: {
            source: 'context'
          }
        }, {
          arg: 'userid',
          type: 'string',
          http: {
            source: 'path'
          },
          required: true
        }],
        returns: [{
          arg: 'result',
          type: 'string'
        }],
        http: {
          verb: 'head',
          path: '/:userid/network'
        },
        isStatic: true,
        description: '',
        notes: ''
      });

    ProfileEntryModel.remoteMethod(
      'getNetwork', {
        accepts: [{
          arg: 'context',
          type: 'object',
          http: {
            source: 'context'
          }
        }, {
          arg: 'userid',
          type: 'string',
          http: {
            source: 'path'
          },
          required: true
        }],
        returns: [{
          arg: 'result',
          type: 'string'
        }],
        http: {
          verb: 'get',
          path: '/:userid/network'
        },
        isStatic: true,
        description: '',
        notes: ''
      });

    ProfileEntryModel.remoteMethod(
      'inviteToNetwork', {
        accepts: [{
          arg: 'context',
          type: 'object',
          http: {
            source: 'context'
          }
        }, {
          arg: 'userid',
          type: 'string',
          http: {
            source: 'path'
          },
          required: true
        }],
        returns: [{
          arg: 'result',
          type: 'string'
        }],
        http: {
          verb: 'post',
          path: '/:userid/network'
        },
        isStatic: true,
        description: '',
        notes: ''
      });

    ProfileEntryModel.remoteMethod(
      'removeFromNetwork', {
        accepts: [{
          arg: 'context',
          type: 'object',
          http: {
            source: 'context'
          }
        }, {
          arg: 'userid',
          type: 'string',
          http: {
            source: 'path'
          },
          required: true
        }],
        returns: [{
          arg: 'result',
          type: 'string'
        }],
        http: {
          verb: 'delete',
          path: '/:userid/network'
        },
        isStatic: true,
        description: '',
        notes: ''
      });

    // following
    ProfileEntryModel.remoteMethod(
      'checkFollowState', {
        accepts: [{
          arg: 'context',
          type: 'object',
          http: {
            source: 'context'
          }
        }, {
          arg: 'userid',
          type: 'string',
          http: {
            source: 'path'
          },
          required: true
        }],
        returns: [{
          arg: 'result',
          type: 'string'
        }],
        http: {
          verb: 'head',
          path: '/:userid/following'
        },
        isStatic: true,
        description: '',
        notes: ''
      });

    ProfileEntryModel.remoteMethod(
      'getFollowedProfiles', {
        accepts: [{
          arg: 'context',
          type: 'object',
          http: {
            source: 'context'
          }
        }],
        returns: [{
          arg: 'result',
          type: 'string'
        }],
        http: {
          verb: 'get',
          path: '/following'
        },
        isStatic: false,
        description: '',
        notes: ''
      });

    ProfileEntryModel.remoteMethod(
      'follow', {
        accepts: [{
          arg: 'context',
          type: 'object',
          http: {
            source: 'context'
          }
        }],
        returns: [{
          arg: 'result',
          type: 'string'
        }],
        http: {
          verb: 'post',
          path: '/following'
        },
        isStatic: false,
        description: '',
        notes: ''
      });

    ProfileEntryModel.remoteMethod(
      'unfollow', {
        accepts: [{
          arg: 'context',
          type: 'object',
          http: {
            source: 'context'
          }
        }],
        returns: [{
          arg: 'result',
          type: 'string'
        }],
        http: {
          verb: 'delete',
          path: '/following'
        },
        isStatic: false,
        description: '',
        notes: ''
      });

  });
};
