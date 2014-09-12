/*
 * angular-blink - v0.1-alpha - 2014-09-12
 * http://github.com/mhssmnn/angular-blink
 * Created by Mark Haussmann; Licensed under Public Domain
 */

(function() {
angular.module('mhBlink', ['ajoslin.promise-tracker'])

// Defaults for user to override
.value('mhBlinkDefaults', {})

// Directive
// - pass in an attribute to track
// i.e. <a ui-sref="user.account" blink-on="uiSref"></a>

.directive('blinkOn', ['$compile', '$parse', '$q', '$timeout', '$templateCache', '$rootScope', 'mhBlinkDefaults', '$http', 'promiseTracker',
  function($compile, $parse, $q, $timeout, $templateCache, $http, $rootScope, globalDefaults, PromiseTracker){

    var name = 'blinkOn';

    var defaults = {
      template:         '<div class="indicators" ng-class="classes"><b></b><b></b><b></b><b></b></div>',
      templateUrl:      '',
      classes:          '',
      blinkingClass:    'blinking',
      successClass:     'blink-success icon-filled-check-circle-2',
      failureClass:     'blink-fail icon-filled-cross-circle-2',
      trackEvents: {
        start:          '$routeChangeStart $stateChangeStart',
        finish:         '$routeChangeSuccess $stateChangeSuccess',
        error:          '$routeChangeError $stateChangeError'
      },
      showSuccessDuration: 2000,
      activationDelay:  0,
      minDuration:      0
    };

    var uniqueFuncName = function(prefix, suffix) {
      prefix = prefix || '';
      suffix = suffix || '';
      return prefix + (String.fromCharCode(65 + Math.floor(Math.random() * 26))) + Date.now() + suffix;
    };

    angular.extend(defaults, globalDefaults);

    return {
      restrict: 'A',
      compile: function($element, attr) {
        var deferred       = $q.defer();
        var tracker        = new PromiseTracker();
        var trackAttrName  = attr[name];
        var trackAttrValue = attr[ trackAttrName ];
        var getOptions     = $parse( attr.blinkOptions );
        var isFunction     = ['uiSref', 'href', 'ngHref'].indexOf(trackAttrName) === -1;
        var wrappedFn;

        // If we are not dealing with a url changing event
        if (isFunction) {
          var functionName = uniqueFuncName( name );

          // Original function to be tracked
          var fn = $parse( trackAttrValue );
          wrappedFn = function(scope) {
            // Expect a promise to be returned, otherwise ignore
            var promise = fn(scope);
            var then = promise && (promise.then || promise.$then ||
                                 (promise.$promise && promise.$promise.then));
            // Skip non-promises
            if (then) {
              deferred = tracker.addPromise(promise);
            }
          };

          // Replace original function with our wrapped function
          attr.$set( trackAttrName, functionName + '()' );
        }

        // Link into the scope
        return function blinkEventHandler(scope, element/*, attr*/) {
          var options = angular.extend(angular.copy(defaults), getOptions(scope));
          var template;

          $q.when( loadTemplate(options.templateUrl) ).then(function(t) {
            var templateScope = scope.$new();
            templateScope.classes = options.classes;
            template = $compile(t)(templateScope);
          });

          tracker = new PromiseTracker(options);

          if (isFunction) {
            // Add wrapped function to scope
            scope[functionName] = wrappedFn.bind(this, scope);
          } else {
            var statusChange = function(ev) {
              if (options.trackEvents.start.indexOf(ev.name) !== -1) {
                tracker.addPromise(deferred.promise);
              } else
              if (options.trackEvents.finish.indexOf(ev.name) !== -1) {
                deferred.resolve();
              } else
              if (options.trackEvents.error.indexOf(ev.name) !== -1) {
                deferred.reject();
              }
            };
            // Otherwise we want to track route events
            angular.forEach(options.trackEvents, function(events) {
              angular.forEach([].concat(events.split(' ')), function(eventName){
                scope.$on(eventName, statusChange);
              });
            });
          }


          // When active, show template and add classes
          // When not active, remove template and classes
          scope.$watch(tracker.active, updateBlinker);



          // Private methods
          // ===============
          // jshint -W003

          function updateBlinker(show) {
            if (show) {
              element
                .addClass( options.blinkingClass )
                .append( template );

              // When the promise gets resolved, update scope with
              // success value
              if (options.showSuccess === true) {
                deferred.promise.then(
                  showResult.bind(null, 'success'),
                  showResult.bind(null, 'failure'));
              }
            } else {
              element
                .removeClass( options.blinkingClass );
              template.remove();
            }
          }
          function showResult(type) {
            element.addClass(options[ type + 'Class' ] || '');
            $timeout(hideResult.bind(null, type), options.showSuccessDuration);
          }

          function hideResult(type) {
            element.removeClass(options[ type + 'Class' ] || '');
          }
          function loadTemplate(templateUrl) {
            // Load template
            if (!templateUrl) {
              return options.template;
            }

            return $http.get( templateUrl, {cache: $templateCache} );
          }
          // jshint +W003
        };
      }
    };
  }
]);

}());