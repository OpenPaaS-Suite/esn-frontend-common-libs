require('./header/profile-menu/profile-menu.module.js');
require('./application-menu.js');
require('./search/search-providers.service.js');

(function(angular) {
  'use strict';

  angular.module('esn.sidebar', [
    'esn.application-menu',
    'esn.profile-menu',
    'esn.search'
  ])

    .constant('CONTEXTUAL_SIDEBAR', {
      animation: 'am-fade-and-slide-left',
      prefixClass: 'aside',
      prefixEvent: 'contextual-sidebar',
      placement: 'left',
      template: require('../../views/modules/sidebar/contextual-sidebar.pug'),
      container: false,
      element: null,
      backdrop: true,
      keyboard: true,
      html: false,
      show: false
    })

    .factory('contextualSidebarService', function($aside, CONTEXTUAL_SIDEBAR) {
      var contextualSidebarService = function(config) {
        var options = angular.extend({}, CONTEXTUAL_SIDEBAR, config);

        return $aside(options);
      };

      return contextualSidebarService;
    })

    .directive('contextualSidebar', function($timeout, $window, $mdUtil, contextualSidebarService, session, searchProviders) {
      function link(scope, element, attr) {
        // Check if we need to show the global search box
        scope.showGlobalSearch = searchProviders.getNumberOfProviders() > 0;

        var options = { scope: scope },
          placementToAnimationMap = {
            left: 'am-fade-and-slide-left',
            right: 'am-fade-and-slide-right'
          };

        angular.forEach(['template', 'templateUrl', 'controller', 'contentTemplate', 'controllerAs'], function(key) {
          if (angular.isDefined(attr[key])) {
            options[key] = attr[key];
          }
        });

        if (angular.isDefined(placementToAnimationMap[attr.placement])) {
          options.placement = attr.placement;
          options.animation = placementToAnimationMap[attr.placement];
        }

        if (options.placement === 'right') {
          scope.hideHeader = true;
        }

        scope.domainId = session.domain._id;
        scope.baseUrl = window.openpaas && window.openpaas.OPENPAAS_API_URL || '';

        var sidebar = contextualSidebarService(options);
        var jWindow = angular.element($window);

        var debouncedOnResize = $mdUtil.debounce(function() {
          if (sidebar && jWindow.width() > 991) {
            sidebar.hide();
          }
        }, 100);

        jWindow.on('resize', debouncedOnResize);

        element.on('click', function() {
          sidebar.toggle();
        });

        scope.$on('$destroy', function() {
          jWindow.off('resize', debouncedOnResize);
          if (sidebar) { sidebar.hide(); }
          options = null;
          sidebar = null;
        });
      }

      return {
        restrict: 'A',
        scope: true,
        link: link
      };

    });

})(angular);
