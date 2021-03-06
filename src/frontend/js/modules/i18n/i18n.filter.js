require('./i18n.service.js');

(function(angular) {
  'use strict';

  angular.module('esn.i18n')
    .filter('esnI18n', function(esnI18nService) {
      return function(input, ignoreSanitizeStrategy = false) {
        var translatedInput = esnI18nService.translate(input, {}, ignoreSanitizeStrategy);

        return translatedInput && typeof translatedInput.toString === 'function' ? translatedInput.toString() : input;
      };
    });
})(angular);
