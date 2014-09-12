describe('blink provider', function() {
  beforeEach(module('ajoslin.promise-tracker'));
  beforeEach(module('mhBlink'));

  var timeout, q, scope, compile;
  beforeEach(inject(function($timeout, $q, $rootScope, $compile) {
    timeout = $timeout;
    q = $q;
    scope = $rootScope;
    compile = $compile;
  }));

  function digest() {
    inject(function($rootScope) { $rootScope.$digest(); });
  }

  it('should retain original functionality', function() {
    var link;

    scope.msg = 'Run for 3s';
    var cb = function(){ scope.msg = 'Just ran!'; };
    scope.runFor = function(secs){
      scope.msg = 'Running...';
      var timer = timeout(cb, parseInt(secs, 10) * 1000);

      // timeout(function(){
      //   timeout.cancel(timer);
      // }, 1000);

      return timer;
    };

    link = compile('<a ng-click="runFor(3)" blink-on="ngClick">{{msg}}</a>')(scope);
    digest();
    link.triggerHandler('click');
    digest();
    expect(link.html()).toContain('Running...');
    timeout.flush();
    expect(link.html()).toContain('Just ran!');
  });

  it('should add classes to the surrounding div', function() {
    var link;
    scope.runFor = function(secs){
      return timeout(angular.noop, parseInt(secs, 10) * 1000);
    };

    link = compile('<a ng-click="runFor(3)" blink-on="ngClick" blink-options="{classes: \'right\'}">{{msg}}</a>')(scope);
    link.triggerHandler('click');
    digest();
    expect(link.find('div').length).toEqual(1);
    expect(link.find('div').hasClass('indicators')).toBe(true);
    expect(link.find('div').hasClass('right')).toBe(true);
  });

  it('should add element when loading', function() {
    var link;
    scope.runFor = function(secs){
      return timeout(angular.noop, parseInt(secs, 10) * 1000);
    };

    link = compile('<a ng-click="runFor(3)" blink-on="ngClick">{{msg}}</a>')(scope);
    link.triggerHandler('click');
    digest();
    expect(link.find('b').length).toEqual(4);
    timeout.flush();
    expect(link.find('b').length).toEqual(0);
  });

});
