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

// "settings": {
//   "mongodb": {
//     "allowExtendedOperators": true
//   }
// }

function pickRequestData(req) {
  return _.merge(
    _.pick(req, []), {
      headers: _.pick(req.headers, ['authorization', 'cookie'])
    });
}

module.exports = function (ProfileEntryModel) {
  ProfileEntryModel.on('dataSourceAttached', function () {
    ProfileEntryModel.find = function (context, query, callback) {
      callback(null, 'OK');
    };

    ProfileEntryModel.getEntry = function (context, userid, callback) {
      profiles.getEntry({
        userid: userid
      }, pickRequestData(context.req), callback);
    };

    ProfileEntryModel.getServiceDocument = function (context, userid, callback) {
      profiles.getServiceDocument({
        userid: userid
      }, pickRequestData(context.req), callback);
    };

    ProfileEntryModel.getEditableFields = function (context, userid, callback) {
      profiles.getEditableFields({
        userid: userid
      }, pickRequestData(context.req), callback);
    };

    ProfileEntryModel.updateEntry = function (context, userid, entry, callback) {
      profiles.updateEntry(_.merge(entry, {
        userid: userid
      }), pickRequestData(context.req), callback);
    };

    ProfileEntryModel.getTags = function (context, userid, contributor, callback) {
      profiles.getTags({
        targetUserid: userid,
        sourceUserid: contributor,
        format: 'full'
      }, pickRequestData(context.req), callback);
    };

    ProfileEntryModel.checkNetworkState = function (context, userid, callback) {
      callback(null, 'OK');
    };
    ProfileEntryModel.getNetwork = function (context, userid, callback) {
      callback(null, 'OK');
    };

    ProfileEntryModel.getNetworkInCommon = function (context, userid, callback) {
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

    // find
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

    // get entry
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
        description: 'Find profile entries matching provided query parameters',
        notes: ''
      });

    // update entry
    ProfileEntryModel.remoteMethod(
      'updateEntry', {
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

    // service document
    ProfileEntryModel.remoteMethod(
      'getServiceDocument', {
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
          type: 'object'
        },
        http: {
          verb: 'get',
          path: '/:userid/service-document'
        },
        isStatic: true,
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
          type: ['string']
        },
        http: {
          verb: 'get',
          path: '/:userid/editable-fields'
        },
        isStatic: true,
        description: 'Get the Profile\'s editable fields',
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
          arg: 'userid',
          type: 'string',
          http: {
            source: 'path'
          },
          required: true
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
          path: '/:userid/tags'
        },
        isStatic: true,
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
        returns: {
          arg: 'result',
          type: 'string'
        },
        http: {
          verb: 'head',
          path: '/:userid/network'
        },
        isStatic: true,
        description: 'Check if the authenticated user has a network relation with the selected profile',
        notes: 'User must be authenticated'
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
        returns: {
          root: true,
          type: ['ProfileEntry']
        },
        http: {
          verb: 'get',
          path: '/:userid/network'
        },
        isStatic: true,
        description: 'Retrieve a Profile\'s network',
        notes: ''
      });

    ProfileEntryModel.remoteMethod(
      'getNetworkInCommon', {
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
        returns: {
          root: true,
          type: ['ProfileEntry']
        },
        http: {
          verb: 'get',
          path: '/:userid/network/in-common'
        },
        isStatic: true,
        description: 'Retrieve network contacts that this profile has in common with the authenticated user',
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
        description: 'Invite a Profile to the authenticated user\'s network',
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
        description: 'Remove a Profile from the authenticated user\'s network',
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
          path: '/me/following'
        },
        isStatic: true,
        description: 'Retrieve a list of Profiles that the authenticated user is following',
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
          path: '/:userid/following'
        },
        isStatic: true,
        description: 'Follow a Profile',
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
          path: '/:userid/following'
        },
        isStatic: true,
        description: 'Stop following a Profile',
        notes: ''
      });

    /*
    /tag-cloud
    /connections/colleagues
    /report-chain
    /profile-type
    */
  });
};