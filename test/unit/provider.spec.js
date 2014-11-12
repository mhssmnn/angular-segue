describe('Segue provider', function() {
  beforeEach(module('mhSegue'));

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

    link = compile('<a ng-click="promise = runFor(3)" segue-promise="promise">{{msg}}</a>')(scope);
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

    link = compile('<a ng-click="promise = runFor(3)" segue-promise="promise">{{msg}}</a>')(scope);
    link.triggerHandler('click');
    digest();
    expect(link.find('div').length).toEqual(1);
    expect(link.find('div').hasClass('indicator')).toBe(true);
  });

  it('should add element when loading', function() {
    var link;
    scope.runFor = function(secs){
      return timeout(angular.noop, parseInt(secs, 10) * 1000);
    };

    link = compile('<a ng-click="promise = runFor(3)" segue-promise="promise">{{msg}}</a>')(scope);
    link.triggerHandler('click');
    digest();
    expect(link.find('div').length).toEqual(1);
    expect(link.find('div').hasClass('indicator')).toBe(true);
    timeout.flush();
    expect(link.find('div').length).toEqual(0);
  });

  it('should update classes throughout lifecycle', function() {
    var link;
    scope.runFor = function(secs){
      return timeout(angular.noop, parseInt(secs, 10) * 1000);
    };

    link = compile('<a ng-click="promise = runFor(3)" segue-promise="promise">{{msg}}</a>')(scope);
    expect(link.hasClass('segue-idle')).toBe(true);
    link.triggerHandler('click');
    digest();
    expect(link.hasClass('segue-indicating')).toBe(true);
    timeout.flush();
    expect(link.hasClass('segue-success')).toBe(true);
    timeout.flush();
    expect(link.hasClass('segue-idle')).toBe(true);
  });

  it('should add failure classes', function() {
    var link;
    scope.runFor = function(secs){
      var deferred = q.defer();
      timeout(deferred.reject, parseInt(secs, 10) * 1000);
      return deferred.promise;
    };

    link = compile('<a ng-click="promise = runFor(3)" segue-promise="promise">{{msg}}</a>')(scope);
    expect(link.hasClass('segue-idle')).toBe(true);
    link.triggerHandler('click');
    digest();
    expect(link.hasClass('segue-indicating')).toBe(true);
    timeout.flush();
    expect(link.hasClass('segue-fail')).toBe(true);
  });

  it('should add custom classes', function() {
    var link;
    scope.runFor = function(secs){
      var deferred = q.defer();
      timeout(deferred.reject, parseInt(secs, 10) * 1000);
      return deferred.promise;
    };

    link = compile('<a ng-click="promise = runFor(3)" segue-promise="promise" segue-options="{indicatorClass: \'right\'}">{{msg}}</a>')(scope);
    expect(link.hasClass('segue-idle')).toBe(true);
    link.triggerHandler('click');
    digest();
    expect(link.find('div').hasClass('right')).toBe(true);
  });

});
