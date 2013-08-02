var symbols = angular.module('Symbols', ['Backend', 'Sites', 'Utils']);

symbols.controller('symbolCtrl', ['$scope', '$routeParams', '$log', '$location', 'db', 'auth', 'utils', 'siteProvider', 'symbolProvider',
function($scope, $routeParams, $log, $location, db, auth, utils, siteProvider, symbolProvider){

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
        $scope.symbol = symbolProvider.getSymbol($routeParams.symbolId);
        $scope.symbol.then(
            function(){
                $log.info($scope, 'symbol loaded');
            },
            function(){
                $location.path('/site/' + $routeParams.siteId);
            });
    }

    $scope.newSymbol = db.newDoc({
        site: $routeParams.siteId
    });
    $scope.saveSymbol = function(symbol){
        var existingSymbol = !!symbol._id;

        if(!existingSymbol){
            $scope.newSymbol = _.extend($scope.newSymbol, symbol, {
                type: 'symbol',
                creator: $scope.auth.loggedInUser.name,
                creationDate: Date()
            });
            $scope.site.load();
        } else {
            $scope.newSymbol = symbol;
        }
        $scope.newSymbol.save().success(function(){
            if(!existingSymbol){
                $scope.site.symbols.push($scope.newSymbol._id);
                $scope.site.save().success(function(){
                    $location.path('/site/' + $scope.site._id + '/symbol/' + $scope.newSymbol._id);
                    // $scope.refreshSymbols();
                    $scope.infoMsg($scope, 'Symbol successfully saved.');
                })
            }
        })
    };
    $scope.delete = function(symbol){
        if(confirm('Are you sure?')){
            $scope.site.symbols = _($scope.site.symbols).without(symbol._id);
            $scope.site.save().success(function(){
                symbol.remove().success(function(){
                    $scope.infoMsg($scope, 'Symbol successfully removed');
                    // $location.path('/site/' + $scope.site._id);
                });
            });
        }
    }

    $scope.editSymbol = function(symbolId){
        $location.path('/site/' + $routeParams.siteId + '/symbol/' + symbolId);
    }


}]);

symbols.factory('symbolProvider', ['$q', 'db', '$log', function($q, db, $log){
    var symbolHash = {};
    return {
        getSymbols: function(symbolIds){
            var res = [], i, id;
            for(i in symbolIds){
                id = symbolIds[i];
                res.push(this.getSymbol(id));
            }
            return $q.all(res);
        },
        getSymbol: function(id) {
            if(!symbolHash[id]){
                var deferred = $q.defer(), doc = db.newDoc();
                doc.load(id).success(function(){
                    deferred.resolve(doc);
                }).error(function(){
                        deferred.reject({reason: "Couldn't load symbol."});
                });
                symbolHash[id] = deferred.promise;
            }
            return symbolHash[id];
        }
    }
}]);