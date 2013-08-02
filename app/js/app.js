'use strict';

// The symbol manager app
var mainApp = angular.module('symbolmanagerApp',
    ['$strap.directives', 'ui.gravatar', 'CornerCouch', 'Backend', 'Users', 'Sites', 'Symbols', 'CustomSite']);

mainApp.value('version', '0.2');


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

mainApp.config(['$routeProvider', function($routeProvider) {
    // Setting up the routes

    // default
    $routeProvider.otherwise({redirectTo: '/dashboard'});
    $routeProvider.when('/dashboard', {templateUrl: 'partials/dashboard.html'});
}]);

// Initialize global scope
mainApp.controller('mainCtrl', ['$scope', '$location', '$timeout', '$log', 'cornercouch', 'auth', 'server', 'db',
function($scope, $location, $timeout, $log, cornercouch, auth, server, db){

    $scope._ = 'mainCtrl';
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
          if(typeof scope === 'string'){
              $scope.errorMsg($scope, 'errorMsg needs $scope as first parameter!');
              $log.error('errorMsg needs $scope as first parameter!');
              return;
          }
          while(!scope.hasOwnProperty('error') && scope.$parent){
              scope = scope.$parent;
          }
          if(scope.hasOwnProperty('error')){
              $timeout.cancel(errorTimeout);
              scope.error = msg;
              $log.error(msg);
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
          if(typeof scope === 'string'){
              $scope.errorMsg($scope, 'infoMsg needs $scope as first parameter!');
              $log.error('infoMsg needs $scope as first parameter!');
              return;
          }
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