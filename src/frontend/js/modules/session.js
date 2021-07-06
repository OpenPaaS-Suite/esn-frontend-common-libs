(function(angular) {
  'use strict';

  angular.module('esn.session', ['esn.user', 'esn.domain', 'esn.template', 'esn.themes', 'esn.auth'])
    .factory('session', function($q) {

      var bootstrapDefer = $q.defer();
      var loggedIn = false;

      var session = {
        user: {},
        domain: {},
        ready: bootstrapDefer.promise,
        isLoggedIn: isLoggedIn,
        setLogout: setLogout,
        setLogin: setLogin,
        getProviderAccounts: function(provider) {
          if (!provider) {
            return [];
          }

          return (session.user.accounts || [])
            .filter(function(account) {
              return account.data && account.data.provider === provider;
            }).map(function(account) {
              return account.data;
            });
        },
        userIsDomainAdministrator: function() {
          if (session.domain.administrator === session.user._id) {
            return true;
          }

          if (!Array.isArray(session.domain.administrators)) {
            return false;
          }

          return session.domain.administrators.some(function(administrator) {
            return administrator.user_id === session.user._id;
          });
        }
      };

      function isLoggedIn() {
        return loggedIn;
      }

      function setLogout() {
        loggedIn = false;
      }

      function setLogin() {
        loggedIn = true;
      }

      var sessionIsBootstraped = false;

      function checkBootstrap() {
        if (sessionIsBootstraped) {
          return;
        }
        if (session.user._id &&
          session.domain._id) {
          sessionIsBootstraped = true;
          bootstrapDefer.resolve(session);
        }
      }

      function setUser(user) {
        angular.copy(user, session.user);

        var emailMap = Object.create(null);

        session.user.emailMap = emailMap;

        session.user.emails.forEach(function(em) {
          emailMap[em] = true;
        });
        checkBootstrap();
      }

      function setDomain(domain) {
        angular.copy(domain, session.domain);
        checkBootstrap();
      }

      session.setUser = setUser;
      session.setDomain = setDomain;

      return session;
    })

    .controller('currentDomainController', function(session, $scope) {
      $scope.domain = session.domain;
    })

  // TODO (esn-frontend-common-libs#51): Write tests for the new changes (https://github.com/OpenPaaS-Suite/esn-frontend-common-libs/pull/48)
    .controller('sessionInitESNController', function($scope, $log, esnTemplate, sessionFactory, esnAuth) {
      $scope.session = {
        template: esnTemplate.templates.loading
      };

      esnAuth.init()
        .then(user => {
          if (!user) {
            return esnAuth.signin().catch(err => {
              $log.debug('Signin error', err);
              $scope.$apply(() => {
                $scope.session.error = 'There was an issue while authenticating user';
                $scope.session.template = esnTemplate.templates.error;
              });
            });
          }

          return sessionFactory.bootstrapSession()
            .then(() => {
            // we $apply because otherwise sometimes angular does not detect the change
              $scope.$apply(() => {
                $scope.session.template = esnTemplate.templates.success;
              });
            });
        })
        .catch(error => {
          if (error.code && error.code === 401) {
            $log.error('failed to fetch the current user', error);

            return esnAuth.signin();
          }

          $scope.$apply(() => {
            $scope.session.error = error.data;
            $scope.session.template = esnTemplate.templates.error;
          });
        });
    })

    .factory('sessionFactory', function($log, $q, Restangular, userAPI, domainAPI, session, themesService, applyThemeService, esnAuth) {

      function onError(error, callback) {
        if (error && error.data) {
          return callback(error.data);
        }
      }

      function bootstrapSession() {
        return new Promise((resolve, reject) => {
          fetchUser(error => {
            if (error) return reject(error);

            themesService.getTheme(session.domain._id).then(theme => {
              applyThemeService.applyTheme(theme);
              resolve();
            }).catch(reject);
          });
        });
      }

      function fetchUser(callback) {
        esnAuth.signInCompletePromise.then(userAPI.currentUser).then(function(response) {
          var user = Restangular.stripRestangular(response.data);

          session.setUser(user);
          var domainIds = angular.isArray(user.domains) ?
            user.domains.map(function(domain) {return domain.domain_id;}) :
            [];

          if (!domainIds.length) {
            var error = {
              error: 400,
              message: 'Invalid user',
              details: 'User does not belong to a domain',
              displayLogout: true
            };

            return callback(error);
          }
          fetchDomain(domainIds[0], function(error) {
            if (error) {
              return callback(error);
            }
            callback(null);
          });
          session.setLogin();
        }, function(error) {
          onError(error, callback);
        });
      }

      function fetchDomain(domainId, callback) {
        domainAPI.get(domainId).then(function(response) {
          session.setDomain(response.data);

          return callback(null);
        }, function(error) {
          onError(error, callback);
        });
      }

      return {
        fetchUser,
        bootstrapSession
      };
    });

})(angular);

require('./template/template.module.js');
require('./user/user.module.js');
require('./domain.js');
require('./themes/themes.module');
require('./auth/auth.module.js');
