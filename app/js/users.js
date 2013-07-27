// User management module
var users = angular.module('users', []);

// auth provides loggedInUser, login, logout, register.
users.factory('auth', ['server', function(server){
    var auth = {
        authenticate: function(user, success, error){
            server.login(user.name, user.password)
                .success(function(){
                    server.getUserDoc();
                    auth.loggedInUser = server.userDoc;
                    success()
                })
                .error(error);

            /*
             var correct = Users[user.name] && Users[user.name].password === user.password;
             if(correct){
             this.loggedInUser = Users[user.name];
             return true;
             } else {
             this.loggedInUser = null;
             return false;
             }
             */
        },
        // loggedInUser: Users.szaby,
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
        server.getUserDoc(function(){
                console.info('userDoc loaded', server.userDoc);
                auth.loggedInUser = server.userDoc;
            });
    });
    server.getUserDB();
    return auth;
}]);

users.controller('loginCtrl', ['$scope', 'auth', function($scope, auth){
    $scope.login = function(user){
        auth.authenticate(user, function(){
            $scope.successMsg = 'Logged in successfully';
            $scope.hide();
        }, function(error){
            $scope.errorMsg = error.reason;
        });
    };
}]);

// Controller for the register form
users.controller('registerCtrl', ['$scope', '$location', 'auth', function($scope, $location, auth){
    $scope.server.session().success(function(){
        if($scope.server.userCtx.name !== null){
            auth.loggedInUser = $scope.server.userCtx;
        }
    });
    $scope.register = function(user){
        $scope.error = $scope.info = '';
        if(user.password === user.repeatPassword){
            auth.register(user, function(){
                $scope.info = 'User successfully registered!';
                $location.path('');
            }, function(error, code){
                $scope.errorMsg = error.reason;
            });
        } else {
            $scope.error = "The passwords don't match!";
        }
    }

}]);
