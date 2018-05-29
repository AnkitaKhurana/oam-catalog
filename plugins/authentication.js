'use strict';
const Bell = require('bell');
var config = require('../config');
var User = require('../models/user');
var Admin = require('../models/admin');

var privateKey = 'AnkitaPrivate';   // Setup Private Key in Config : Later

// Validate Funcation for JWT
var validate = function (decodedToken, request, callback) {
  var credentials = {};
  var error = '';
  Admin.isValidAdmin(decodedToken.data.name, decodedToken.data.password, function (admin, err) {
    credentials = admin;
    error = err;
    if (!credentials) {
      return callback(error, false, credentials);
    }

    return callback(error, true, credentials);
  });
};
var Authentication = {
  register: function (server, options, next) {
    server.register([
      { register: require('hapi-auth-cookie') },
      // Various OAuth login strategies
      { register: require('bell') },
      { register: require('hapi-auth-jwt2') }
    ], function (err) {
      if (err) throw err;

      const facebookCustom = Bell.providers.facebook({
        fields: 'id,name,email,first_name,last_name,picture.type(small)'
      });
      // Facebook OAuth login flow
      server.auth.strategy('facebook', 'bell', {
        provider: facebookCustom,
        password: config.cookiePassword,
        clientId: config.facebookAppId,
        clientSecret: config.facebookAppSecret,
        isSecure: config.isCookieOverHTTPS
      });

      // Google OAuth login flow
      server.auth.strategy('google', 'bell', {
        provider: 'google',
        password: config.cookiePassword,
        clientId: config.googleClientId,
        clientSecret: config.googleClientSecret,
        isSecure: config.isCookieOverHTTPS
      });

      server.auth.strategy('session', 'cookie', {
        password: config.cookiePassword,
        cookie: config.sessionCookieKey,
        domain: config.hostTld === 'localhost' ? null : config.hostTld,
        clearInvalid: true,
        redirectTo: false,
        validateFunc: User.validateSession.bind(User),
        isHttpOnly: false, // so JS can see it
        isSecure: config.isCookieOverHTTPS
      });

      server.auth.strategy('jwt', 'jwt', {
        key: privateKey,
        validateFunc: validate,
        verifyOptions: { algorithms: [ 'HS256' ] }
      });
      next();
    });
  }
};

Authentication.register.attributes = {
  name: 'authentication'
};

module.exports = Authentication;
