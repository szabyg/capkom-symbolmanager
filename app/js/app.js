'use strict';

// The symbol manager app
var mainApp = angular.module('symbolmanagerApp', ['$strap.directives', 'ui.gravatar', 'CornerCouch', 'backend', 'users', 'sites']);

// Configure routes
mainApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.otherwise({redirectTo: '/dashboard'});
    $routeProvider.when('/dashboard', {templateUrl: 'partials/dashboard.html'});
    $routeProvider.when('/register', {templateUrl: 'partials/register.html', controller: 'registerCtrl'});
    $routeProvider.when('/site/:siteId', {templateUrl: 'partials/site.html', controller: 'sitesCtrl'});
    $routeProvider.when('/site/:siteId/createSymbol', {templateUrl: 'partials/symbolform.html', controller: 'sitesCtrl'});
    $routeProvider.when('/createSite', {templateUrl: 'partials/siteform.html', controller: 'sitesCtrl'});
}]);

// Initialize global scope
mainApp.run(['$rootScope', 'cornercouch', 'auth', 'server', 'db', function($scope, cornercouch, auth, server, db){
    $scope.server = server;
    $scope.db = db;
    $scope.auth = auth;
    $scope.error = function(msg){

    }
}]);
