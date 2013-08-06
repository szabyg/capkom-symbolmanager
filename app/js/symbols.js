var symbols = angular.module('Symbols', ['Backend', 'Sites', 'Utils']);

symbols.controller('symbolCtrl', ['$scope', '$routeParams', '$log', '$location', '$q', 'db', 'auth', 'utils', 'siteProvider', 'symbolProvider',
function($scope, $routeParams, $log, $location, $q, db, auth, utils, siteProvider, symbolProvider){

    $scope._ = 'symbolCtrl';
    siteProvider.getSite($routeParams.siteId).then(function(site){
        $scope.site = site;
        // $scope.refreshSymbols();
    });
    $scope.$watch('site.symbols', function(){
        if($scope.site){
            $scope.refreshSymbols();
        }
    })
    $scope.refreshSymbols = function(){
        $scope.symbols = symbolProvider.getSymbols($scope.site.symbols);
    };

    if($routeParams.symbolId) {
        symbolProvider.getSymbol($routeParams.symbolId).then(
            function(symbol){
                $scope.symbol = symbol;
                $log.info($scope, 'symbol loaded', $scope.symbol);
            },
            function(){
                $location.path('/site/' + $routeParams.siteId);
            });
    }

    $scope.newSymbol = db.newDoc({
        site: $routeParams.siteId
    });

    function _saveSymbolDoc(symbolDoc){
        var deferred = $q.defer();
        if(!symbolDoc._id){
            symbolDoc.save().success(function(){
                deferred.resolve(symbolDoc);
            }).error(function(err){
                $scope.errorMsg($scope, err.reason);
            });
        } else {
            deferred.resolve();
        }
        return deferred.promise;
    }
    $scope.saveSymbol = function(symbol){
        var existingSymbol = !!symbol._id,
            upload = false;
        var newSymbol = _.extend($scope.newSymbol, symbol, {
            type: 'symbol',
            creator: $scope.auth.loggedInUser,
            creationDate: Date()
        });
        if($scope.file1 && $scope.file1.file && $scope.newSymbol.file !== $scope.file1.file.name){
            newSymbol.file = $scope.file1.file.name;
            upload = true;
        };
        _saveSymbolDoc(newSymbol).then(function(newSymbol){
            var attachmentDone = $q.defer();
            if(upload){
                $scope.newSymbol.attach($scope.file1.file).success(function(){
                    $scope.infoMsg($scope, 'Upload worked!');
                    symbol.file = $scope.newSymbol.file;
                    attachmentDone.resolve();
                })
            } else {
                attachmentDone.resolve();
            }

            attachmentDone.promise.then(function(){
                symbol = $scope.newSymbol;
                $scope.site.load().success(function(){
                    if($scope.site.symbols.indexOf($scope.newSymbol._id) === -1){
                        $scope.site.symbols.push($scope.newSymbol._id);
                    }
                    $scope.site.save().success(function(){
                        $location.path('/site/' + $scope.site._id + '/symbol/' + $scope.newSymbol._id);
                        $scope.infoMsg($scope, 'Symbol successfully saved.');
                    })
                })
            })
        })
    };
    $scope.delete = function(symbol){
        if(confirm('Are you sure?')){
            $scope.site.symbols = _($scope.site.symbols).without(symbol._id);
            $scope.site.save().success(function(){
                symbol.remove().success(function(){
                    $scope.infoMsg($scope, 'Symbol successfully removed');
                    $location.path('/site/' + $scope.site._id);
                });
            });
        }
    };

    $scope.detachFile = function(){
        var fn = $scope.symbol.file;
        delete $scope.symbol.file;
        $scope.symbol.save().then(function(){
            $scope.symbol.detach(fn);
        });
        return true;
    }

    $scope.editSymbol = function(symbolId){
        $location.path('/site/' + $routeParams.siteId + '/symbol/' + symbolId);
    }


}]);

symbols.factory('symbolProvider', ['$q', 'db', '$log', function($q, db, $log){
    var symbolHash = {};
    return {
        getSymbols: function(symbolIds){
            return db.getDocs(symbolIds);
        },
        getSymbol: function(id) {
            return db.getDoc(id);
        }
    }
}]);

symbols.factory('customSymbolProvider', ['$q', 'db', '$log', function($q, db, $log){
    var symbolHash = {};
    return {
        getCustomSymbols: function(symbolIds){
            return db.getDocs(symbolIds);
        },
        getCustomSymbol: function(id) {
            return db.getDoc(id);
        },
        saveCustomSymbol: function(customSymbol){
            return db.saveDoc(customSymbol);
        }
    };
}]);

symbols.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/site/:siteId/createSymbol', {
        templateUrl: 'partials/forms/symbolform.html',
        controller: 'symbolCtrl'
    });
    $routeProvider.when('/site/:siteId/symbol/:symbolId', {
        templateUrl: 'partials/forms/symbolform.html',
        controller: 'symbolCtrl'
    });
}]);
