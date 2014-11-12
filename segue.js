/*
 * angular-segue - v0.0.1 - 2014-11-13
 * http://github.com/mhssmnn/angular-segue
 * Created by Mark Haussmann; Licensed under Public Domain
 */

(function() {
'use strict';
angular.module('mhSegue', [])

.provider('$segue', function(){
  var defaultOptions = {
    template:         '<div class="indicator"></div>',
    templateUrl:      '',
    defaultClass:     'segue-idle',
    indicatingClass:  'segue-indicating',
    successClass:     'segue-success',
    failureClass:     'segue-fail',
    indicatorClass:   '',
    successDuration:  3000
  };

  // The options specified to the provider globally.
  var globalOptions = {};

  /**
   * `options({})` allows global configuration of all segues in the
   * application.
   *
   *   var app = angular.module( 'App', ['mhSegue'], function( $segueProvider ) {
   *     $segueProvider.options( { defaultClass: 'loading' } );
   *   });
   */
  this.options = function( value ) {
    angular.extend( globalOptions, value );
  };

  /**
   * Returns the actual instance of the $segue service.
   */
  this.$get = ['$q', '$templateCache', '$timeout', '$parse',
  function($q,   $templateCache, $timeout, $parse){
    var options = angular.extend({}, defaultOptions, globalOptions);

    function loadTemplate() {
      return $q.when(
        options.templateUrl ?
          $http.get( options.templateUrl, {cache: $templateCache} ) :
          options.template
      ).then(function(el){
        return angular.element(el);
      });
    }

    return function $segue(optionsAttr, scope) {
      var template, opts = options;

      if (angular.isDefined(optionsAttr)) {
        opts = angular.extend({}, options, $parse(optionsAttr)(scope));
      }

      loadTemplate().then(function(el) {
        template = el;
        template.addClass(opts.indicatorClass);
      });

      return {
        setIdle: function(elem) {
          elem.addClass(opts.defaultClass);
          elem.removeClass(opts.indicatingClass)
              .removeClass(opts.failureClass)
              .removeClass(opts.successClass);
        },

        setIndicating: function(elem) {
          elem.append(template);
          elem.addClass(opts.indicatingClass);
        },

        setSuccess: function(elem) {
          template.remove();
          elem.removeClass(opts.indicatingClass);
          elem.addClass(opts.successClass);
          $timeout(this.setIdle.bind(this, elem), opts.successDuration);
        },

        setFailure: function(elem) {
          template.remove();
          elem.removeClass(opts.indicatingClass);
          elem.addClass(opts.failureClass);
        }

      };
    };

  }];

})

.directive('seguePromise', function($segue){
  return {
    restrict: 'A',
    link: function(scope, elem, attr){
      var segue = $segue(attr.segueOptions, scope);
      segue.setIdle(elem);

      scope.$watch(attr.seguePromise, function(val){
        // Bind promise events
        if (angular.isDefined(val) && angular.isFunction(val.then)) {
          segue.setIndicating(elem);
          val.then(
            segue.setSuccess.bind(segue, elem),
            segue.setFailure.bind(segue, elem));
        }
      });
    }
  };
})

.directive('segueState', function($segue, $injector){
  var $state;

  // Copied from ui-router
  // jshint -W116, -W109, -W003
  function parseStateRef(ref, current) {
    var preparsed = ref.match(/^\s*({[^}]*})\s*$/), parsed;
    if (preparsed) ref = current + '(' + preparsed[1] + ')';
    parsed = ref.replace(/\n/g, " ").match(/^([^(]+?)\s*(\((.*)\))?$/);
    if (!parsed || parsed.length !== 4) throw new Error("Invalid state ref '" + ref + "'");
    return { state: parsed[1], paramExpr: parsed[3] || null };
  } // jshint +W116, +W109
  function equalForKeys(a, b, keys) {
    if (!keys) {
      keys = [];
      for (var n in a) { keys.push(n); } // Used instead of Object.keys() for IE8 compatibility
    }

    for (var i=0; i<keys.length; i++) {
      var k = keys[i];
      // Not '===', values aren't necessarily normalized
      if (a[k] != b[k]) { return false; } // jshint ignore:line
    }
    return true;
  }
  // jshint +W003

  return {
    restrict: 'A',
    link: function(scope, elem, attr) {
      var segue = $segue(attr.segueOptions, scope);
      var $state = $state || $injector.get('$state');
      var events = {
        start: '$stateChangeStart',
        success: '$stateChangeSuccess',
        failure: '$stateChangeError'
      };
      var testIdentity = function(uiSrefValue, toState, toParams) {
        var ref = parseStateRef(uiSrefValue, $state.current);
        var params = ref.paramExpr ? scope.$eval(ref.paramExpr) : null;
        var orgState = $state.get(ref.state, $state.current);
        return orgState === toState && (!params || equalForKeys(params, toParams));
      };

      segue.setIdle(elem);

      scope.$on(events.start, function(ev, state, toParams){
        if (testIdentity(attr.uiSref, state, toParams)) {
          segue.setIndicating(elem);
        }
      });

      scope.$on(events.success, function(ev, state, toParams){
        if (testIdentity(attr.uiSref, state, toParams)) {
          segue.setSuccess(elem);
        }
      });

      scope.$on(events.failure, function(ev, state, toParams){
        if (testIdentity(attr.uiSref, state, toParams)) {
          segue.setFailure(elem);
        }
      });
    }
  };
})

.directive('segueRoute', function($segue, $injector, $location){
  var $route;

  return {
    restrict: 'A',
    link: function(scope, elem, attr) {
      var segue = $segue(attr.segueOptions, scope);
      var $route = $route || $injector.get('$route');
      var events = {
        start: '$routeChangeStart',
        success: '$routeChangeSuccess',
        failure: '$routeChangeError'
      };
      var testIdentity = function(href, route) {
        href = href.slice(0, 1) === '#' ? href.slice(1) : href;
        return route.regexp.test(href);
      };

      segue.setIdle(elem);

      scope.$on(events.start, function(ev, toRoute){
        if (testIdentity(attr.ngHref, toRoute.$$route)) {
          segue.setIndicating(elem);
        }
      });

      scope.$on(events.success, function(ev, toRoute){
        if (testIdentity(attr.ngHref, toRoute.$$route)) {
          segue.setSuccess(elem);
        }
      });

      scope.$on(events.failure, function(ev, toRoute){
        if (testIdentity(attr.ngHref, toRoute.$$route)) {
          segue.setFailure(elem);
        }
      });
    }
  };
})

// Helper Directive
// - wraps the element below with a .segue-hidden class
.directive('segueHidden', function(){
  return {
    restrict: 'AE',
    template: '<span class="segue-hidden" ng-transclude></span>',
    transclude: true
  };
});

}());