// User management module
var users = angular.module('Users', ['Backend']);

// auth provides loggedInUser, login, logout, register.
users.factory('auth', ['$log', 'server', 'defaultCredentials', function($log, server, defaultCredentials){
    var auth = {
        authenticate: function(user, success, error){
            auth._userPromise = server.login(user.name, user.password)
                .success(function(){
                    server.getUserDoc();
                    auth.loggedInUser = server.userDoc;
                    success()
                })
                .error(error);
            auth.userLoaded = auth._userPromise.success;
        },
        logout: function() {
            server.logout();
            delete this.loggedInUser;
        },
        register: function(user, success, error){
            user.type = 'user';
            user.roles = [];
            delete user.repeatPassword;
            user._id = "org.couchdb.user:" + user.name;
            var promise = server.userDB.newDoc(user).save();
            if(success){
                promise.success(success);
            }
            if(error){
                promise.error(error);
            }
        }
    };

    server.session().success(function(){
        auth.loggedInUser = server.getUserDoc();
        if(server.userCtx.name !== null){
            auth.loggedInUser = server.userDoc;
        } else {
            // Test phase: Log in automatically
            if(defaultCredentials){
                auth.authenticate(defaultCredentials,
                function(){
                    $log.info('demo-logged in');
                }, function(err){
                    $log.error('demo-login error', err);
                });
            }
        }
    });
    server.getUserDB();
    return auth;
}]);

users.factory('loggedInUser', ['auth', function(auth){

}]);

users.controller('loginCtrl', ['$scope', 'auth', function($scope, auth){

    $scope._ = 'loginCtrl';
    $scope.info = $scope.error = '';

    $scope.login = function(user){
        auth.authenticate(user, function(){
            $scope.infoMsg($scope, 'Logged in successfully');
            $scope.hide();
        }, function(error){
            $scope.errorMsg($scope, error.reason);
        });
    };
}]);

// Controller for the register form
users.controller('registerCtrl', ['$scope', '$location', 'auth', function($scope, $location, auth){

    $scope._ = 'registerCtrl';
    $scope.register = function(user){
        if(user.password === user.repeatPassword){
            auth.register(user, function(){
                $scope.infoMsg($scope, 'User successfully registered!');
                $location.path('');
            }, function(error, code){
                $scope.errorMsg = error.reason;
            });
        } else {
            $scope.error = "The passwords don't match!";
        }
    }

}]);

angular.module('symbolmanagerApp').config(['$routeProvider', function($routeProvider) {
    // Dashboard and authentication
    $routeProvider.when('/register', {templateUrl: 'partials/register.html', controller: 'registerCtrl'});
    // Site management
}]);
