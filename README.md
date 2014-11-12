angular-segue
=============

> **Version**: 0.3-alpha

Small, simple directives to add promise/request tracking to an element in your angular app.

* [Quick Start](#quick-start)
* [API Documentation](#api-documentation)
* [Changes](https://github.com/mhssmnn/angular-blink/tree/master/CHANGELOG.md)
* [License](#license)

## Quick Start

```sh
$ bower install angular-segue
```

The basic idea: support loading indicators (segue's) on individual elements (i.e. an `<a class="btn">`). This allows you to support things like showing spinners on the buttons used to submit forms.

We do this by adding one of the supplied directives to the element:

* `segue-promise` - segue when it receives a promise
* `segue-state` - segue when it matches the state
* `segue-route` - segue when it matches the route

Segue has 4 states which it displays through a `class` on the element: `segue-idle`, `segue-indicating`, `segue-success`, `segue-fail`.

When indicating a new element is created from `options.template` which is appended to the directive's element. The default element is `<div class="indicator"></div>`

### Segue Promise

Segue promise works well when using `ng-click`. Change the function in `ng-click` to return a promise, then segue shows when promise is being resolved:

```html
<button ng-click="p = doSomething()" segue-promise="p">Submit</button>
```
```js
angular.module('myApp', ['mhSegue'])
.controller('MainCtrl', function($scope, $timeout) {
  $scope.doSomething = function() {
    // Timeout returns a promise
    return $timeout(angular.noop, 1000);
  }
});
```

### Segue State

Segue state works with [ui-router](https://github.com/angular-ui/ui-router) and can detect when transitioning to the state referenced on the element.

```html
<a ui-sref="foo.bar" segue-state></a>
```

### Segue Route

Similar to segue state, but works with angular-router.

```html
<a ng-href="/foo/bar" segue-route></a>
```


## Development

* Install karma & grunt with `npm install -g karma grunt-cli` to build & test
* Install local dependencies with `bower install && npm install`
* Run `grunt` to lint, test, build the code
* Run `grunt dev` to watch and re-test on changes

## <a id="license"></a>License

> <a rel="license" href="http://creativecommons.org/publicdomain/mark/1.0/"> <img src="http://i.creativecommons.org/p/mark/1.0/80x15.png" style="border-style: none;" alt="Public Domain Mark" /> </a> <span property="dct:title">angular-segue</span> by <a href="https://github.com/mhssmnn" rel="dct:creator"><span property="dct:title">Mark Haussmann</span></a> is free of known copyright restrictions.
