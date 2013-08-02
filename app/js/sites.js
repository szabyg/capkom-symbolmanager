// A site is a website consisting of a url, name and an array of symbols.

var sites = angular.module('Sites', ['Backend', 'Utils']);

sites.factory('siteProvider', ['$q', 'db', 'auth', function($q, db, auth){
    var symbolHash = {}, sites = {};
    return {
        createSite: function(site){
            var doc = db.newDoc({
                type: 'site',
                symbols: []
            });
            return doc;
        },
        getSites: function(){
            var deferred = $q.defer();
            db.query('default', 'sites', {include_docs: false, key: auth.loggedInUser.name})
                .success(function(res){
                    deferred.resolve(_.map(res.rows, function(row, idx){
                        return db.getQueryDoc(idx);
                    }));
                })
                .error(function(err){
                    deferred.reject(err);
                    /*
                    var res = [
                        {
                            url: 'http://capkom.salzburgresearch.at',
                            name: 'CapKom wizard',
                            symbols: ['sym1', 'sym2']
                        },
                        {
                            url: 'http://www.salzburgresearch.at',
                            name: 'Salzburg Research',
                            symbols: ['sym3', 'sym4']
                        }

                    ];
                    deferred.resolve(res);
                    */
                });
            return deferred.promise;
            // db.queryAll().success(success);
        },
        getSite: function(siteId){
            var deferred = $q.defer();
            var site = db.newDoc(), res;

            site.load(siteId).success(function(){
                deferred.resolve(site);
            }).error(function(err){
                    deferred.reject(err.reason);
            });
            return deferred.promise;
        }
    }
}]);

//sites.factory('currentSite', ['db', 'auth', 'siteProvider', function(db, auth, siteProvider){
//
//}]);

sites.controller('sitesCtrl', ['$scope', 'siteProvider', 'symbolProvider', '$location', '$routeParams', 'utils', '$log',
function($scope, siteProvider, symbolProvider, $location, $routeParams, utils, $log){

    $scope._ = 'sitesCtrl';
    $scope.newSite = siteProvider.createSite();

    if($routeParams.siteId){
        siteProvider.getSite($routeParams.siteId).then(function(site){
            $scope.site = site;
            $scope.symbols = symbolProvider.getSymbols($scope.site.symbols);
        });
    } else {

    }

    $scope.editSite = function(site){
        $location.path('/site/' + site._id);
    };
    $scope.deleteSite = function(site){
        if(confirm('Are you sure?')){
            site.remove().success(function(){
                $scope.infoMsg($scope, 'Site successfully removed');
                $location.path('/');
            });
        }
    }

    $scope.saveSite = function(site){
        $scope.newSite = _.extend($scope.newSite, site, {
            creator: $scope.auth.loggedInUser.name,
            creationTime: Date()
        });
        $log.info($scope.newSite);
        $scope.newSite.save().success(function(){
            $log.info('success');
            utils.clean(site);
            $location.path('');
        });
    };
    $scope.$watch('auth.loggedInUser.name', function(){
        if($scope.auth.loggedInUser && $scope.auth.loggedInUser.name){
            if(!$routeParams.siteId){
                siteProvider.getSites().then(function(res){
                    $scope.sites = res;
                    $log.info('sites', res);
                });
            }
        } else {
            if($scope.sites){
                delete $scope.sites;
                $location.path('/');
            }
        }
    });
    $scope.removeSite = function(site){
        $log.info('remove', site);
        var answer = confirm('Are you sure you would like to remove the entire site settings?');
        if(answer){
            site.remove()
                .success(function(){
                    $scope.sites = _($scope.sites).without(site);
                    $scope.infoMsg($scope, 'Successfully deleted ' + site.name);
                }).error(function(err){
                    $scope.error = err.reason;
                })
        }
    };
    $scope.editSymbol = function(symbolId){
        $location.path('/site/' + $routeParams.siteId + '/symbol/' + symbolId);
    }

}]);

sites.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/createSite', {templateUrl: 'partials/siteform.html', controller: 'sitesCtrl'});
    $routeProvider.when('/site/:siteId', {templateUrl: 'partials/site.html', controller: 'sitesCtrl'});
    // Symbol management
}]);
