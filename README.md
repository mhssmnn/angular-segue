angular-segue
=============

> **Version**: 0.0.2

Small, feature filled library used to easily add spinners or general promise/request tracking to your angular app.

* [Quick Start](#quick-start)
* [API Documentation](#api-documentation)
* [Changes](https://github.com/ajoslin/angular-promise-tracker/tree/master/CHANGELOG.md)
* [License](#license)

## Quick Start

The basic idea: each time we add one or more promises to an instance of a `promiseTracker`, that instance's `active()` method will return true until all added promises are resolved. A common use case is showing some sort of loading spinner while some http requests are loading.

[Play with this example on plunkr](http://plnkr.co/edit/PrO2ou9b1uANbeGoX6eB?p=preview)

```sh
$ bower install angular-segue
```
```html
<body ng-app="myApp" ng-controller="MainCtrl">
  <div class="my-super-awesome-loading-box" ng-show="loadingTracker.active()">
    Loading...
  </div>
  <button ng-click="delaySomething()">Delay Something</button>
  <button ng-click="fetchSomething()">Fetch Something</button>

  <script src="angular.js"></script>
  <script src="promise-tracker.js"></script>

  <!-- optional for $http sugar -->
  <script src="promise-tracker-http-interceptor.js"></script>
</body>
```
```js
angular.module('myApp', ['ajoslin.promise-tracker'])
.controller('MainCtrl', function($scope, $http, $timeout, promiseTracker) {
  //Create a new tracker
  $scope.loadingTracker = promiseTracker();

  //use `addPromise` to add any old promise to our tracker
  $scope.delaySomething = function() {
    var promise = $timeout(function() {
      alert('Delayed something!');
    }, 1000);
    $scope.loadingTracker.addPromise(promise);
  };

  //use `tracker:` shortcut in $http config to link our http promise to a tracker
  //This shortcut is included in promise-tracker-http-interceptor.js
  $scope.fetchSomething = function(id) {
    return $http.get('/something', {
      tracker: $scope.loadingTracker
    }).then(function(response) {
      alert('Fetched something! ' + response.data);
    });
  };
});
```



## Development

* Install karma & grunt with `npm install -g karma grunt-cli` to build & test
* Install local dependencies with `bower install && npm install`
* Run `grunt` to lint, test, build the code
* Run `grunt dev` to watch and re-test on changes

## <a id="license"></a>License

> <a rel="license" href="http://creativecommons.org/publicdomain/mark/1.0/"> <img src="http://i.creativecommons.org/p/mark/1.0/80x15.png" style="border-style: none;" alt="Public Domain Mark" /> </a> <span property="dct:title">angular-segue</span> by <a href="https://github.com/mhssmnn" rel="dct:creator"><span property="dct:title">Mark Haussmann</span></a> is free of known copyright restrictions.
