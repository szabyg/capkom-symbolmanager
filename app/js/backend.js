// The backend module sets up the communication facilities to the back end using CornerCouch.

var backend = angular.module('backend', ['CornerCouch']);

// server is the couchdb server
backend.factory('server', ['cornercouch', function(cornercouch){
    return cornercouch('http://szaby.iriscouch.com', 'JSONP');
}]);

// db is the database
backend.factory('db', ['server', function(server){
    return server.getDB('csm');
}])