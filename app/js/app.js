'use strict';

// The symbol manager app
var mainApp = angular.module('symbolmanagerApp',
    ['$strap.directives', 'ui.gravatar', 'CornerCouch', 'Backend', 'Users', 'Sites', 'Symbols', 'CustomSite']);

mainApp.value('version', '0.1');


var szaby = {
    name: 'szaby',
    password: 'asdf'
    }, panni = {
    name: 'panni',
    password: 'asdf'
}

//mainApp.value('defaultCredentials', null);
//mainApp.value('defaultCredentials', szaby);
mainApp.value('defaultCredentials', panni);

// Configure routes
mainApp.config(['$routeProvider', function($routeProvider) {
    // Setting up the routes

    // default
    $routeProvider.otherwise({redirectTo: '/dashboard'});
    // Dashboard and authentication
    $routeProvider.when('/dashboard', {templateUrl: 'partials/dashboard.html'});
    $routeProvider.when('/register', {templateUrl: 'partials/register.html', controller: 'registerCtrl'});

    // Site management
    $routeProvider.when('/createSite', {templateUrl: 'partials/siteform.html', controller: 'sitesCtrl'});
    $routeProvider.when('/site/:siteId', {templateUrl: 'partials/site.html', controller: 'sitesCtrl'});

    // Symbol management
    $routeProvider.when('/site/:siteId/createSymbol', {
        templateUrl: 'partials/symbolform.html',
        controller: 'symbolCtrl'
    });
    $routeProvider.when('/site/:siteId/symbol/:symbolId', {
        templateUrl: 'partials/symbolform.html',
        controller: 'symbolCtrl'
    });

    $routeProvider.when('/createCustomSite', {templateUrl: 'partials/customsiteform.html', controller: 'customSiteCtrl'});
    // Custom symbol management
}]);

// Initialize global scope
mainApp.controller('mainCtrl', ['$scope', '$location', '$timeout', 'cornercouch', 'auth', 'server', 'db',
function($scope, $location, $timeout, cornercouch, auth, server, db){
    $scope.info = $scope.error = '';
    $scope.server = server;
        $scope.db = db;
        $scope.auth = auth;

        // Watch logout and send route to the dashboard when user logged out.
        var watchLogout = false;
    $scope.$watch('auth.loggedInUser.name', function(){
        if($scope.auth.loggedInUser && $scope.auth.loggedInUser.name){
            watchLogout = true;
        } else {
            if(watchLogout){
                $location.path('/');
            }
        }
    });

    var errorTimeout;
      $scope.errorMsg = function(scope, msg){
          while(!scope.hasOwnProperty('error') && scope.$parent){
              scope = scope.$parent;
          }
          if(scope.hasOwnProperty('error')){
              $timeout.cancel(errorTimeout);
              scope.error = msg;
              errorTimeout = $timeout((function(scope){
                  return function(){
                    scope.error = '';
                  }
              })(scope), 5000);
          } else {
              debugger;
          }
      }
      var infoTimeout;
      $scope.infoMsg = function(scope, msg){
          while(!scope.hasOwnProperty('info') && scope.$parent){
              scope = scope.$parent;
          }
          if(scope.hasOwnProperty('info')){
              $timeout.cancel(infoTimeout);
              scope.info = msg;
              infoTimeout = $timeout((function(scope){
                  return function(){
                    scope.info = '';
                  }
              })(scope), 3000);
          } else {
              debugger;
          }
      }
}]);
mainApp.directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
        elm.text(version);
    };
}]);