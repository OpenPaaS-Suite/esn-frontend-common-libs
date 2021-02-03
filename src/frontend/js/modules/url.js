(function(angular) {
  'use strict';

  angular.module('esn.url', ['esn.ui'])

    .factory('urlUtils', function($window) {

      // Add / Update a key-value pair in the URL query parameters
      // Thank to http://stackoverflow.com/questions/5999118/add-or-update-query-string-parameter
      function updateUrlParameter(uri, key, value) {
        value = $window.encodeURIComponent(value);
        // remove the hash part before operating on the uri
        var i = uri.indexOf('#');
        var hash = i === -1 ? '' : uri.substr(i);

        uri = i === -1 ? uri : uri.substr(0, i);

        var re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
        var separator = uri.indexOf('?') !== -1 ? '&' : '?';

        if (re.test(uri)) {
          uri = uri.replace(re, '$1' + key + '=' + value + '$2');
        } else {
          uri = uri + separator + key + '=' + value;
        }

        return uri + hash; // finally append the hash as well
      }

      function isValidURL(string) {
        if (typeof string !== 'string') {
          return false;
        }

        // eslint-disable-next-line no-useless-escape
        return string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g) !== null;
      }

      function isAbsoluteURL(url) {
        if (typeof url !== 'string') {
          return false;
        }

        return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url);
      }

      return {
        updateUrlParameter,
        isValidURL,
        isAbsoluteURL
      };

    })

    .factory('absoluteUrl', function(createHtmlElement) {
      return function(url) {
        return createHtmlElement('a', { href: url }).href;
      };
    });

})(angular);

require('./ui.js');
