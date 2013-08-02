var customsite = angular.module('CustomSite', ['Backend']);

customsite.controller('customSitesCtrl', ['$scope', '$routeParams', '$log', '$location', 'customsiteProvider',
function($scope, $routeParams, $log, $location, customsiteProvider){

    $scope._ = 'customSitesCtrl';
    $scope.$routeParams = $routeParams;

    var errFn = function(errMsg){$scope.errorMsg($scope, errMsg);};

    // load customizable sites
    $scope.$watch('auth.loggedInUser.name', function(){
        if($scope.auth.loggedInUser.name){
            customsiteProvider.loadCustomizableSites().then(function(sites){
                // ... and the ones that are customized
                customsiteProvider.loadCustomizedSites().then(function(customSites){
                    $scope.customizedSites = {};
                    _.each(customSites, function(customSite){
                        $scope.customizedSites[customSite.site] = customSite;
                    });
                    $scope.sites = sites;
                }, errFn)
            }, errFn);
        }
    });

    $scope.customize = function(site) {
        if(!!$scope.customizedSites[site._id]){
            $location.path('/customSite/' + $scope.customizedSites[site._id]._id);
        } else {
            customsiteProvider.saveCustomSite({
                type: 'customSite',
                creationDate: Date(),
                owner: $scope.auth.loggedInUser._id,
                site: site._id,
                symbols: []
            }).then(function(customSite){
                $location.path('/customSite/' + customSite._id);
            }, errFn);
        }
    };

    $scope.isCustomized = function(site){
        return !!$scope.customizedSites[site._id];
    };
}]);
customsite.controller('customSiteCtrl', ['$scope', '$routeParams', '$log', '$location', 'siteProvider', 'customsiteProvider',
function($scope, $routeParams, $log, $location, siteProvider, customsiteProvider){

    $scope._ = 'customSiteCtrl';
    var errFn = function(errMsg){$scope.errorMsg($scope, errMsg);};

    // Load custom site
    $scope.$watch('auth.loggedInUser.name', function(){
        if($scope.auth.loggedInUser.name){
            customsiteProvider.getCustomSite($routeParams.customsiteId).then(function(customSite){
                $scope.customSite = customSite;

                customSymbolProvider.getCustomSymbols($scope.customSite.symbols).then(function(customSymbols){
                    $scope.customSymbols = customSymbols;
                }, errFn);

                // Load base site
                siteProvider.getSite($scope.customSite.site).then(function(site){
                    $scope.site = site;

                    // Load base symbols
                    symbolsProvider.getSymbols($scope.site.symbols).then(function(symbols){
                        $scope.symbols = symbols;
                    }, errFn)
                }, errFn);
                $log.info('Custom site loaded');
            }, errFn);
        }
    });
}]);

customsite.factory('customsiteProvider', ['db', 'auth', '$q', function(db, auth, $q){
    var sites = [];
    return {
        loadCustomizableSites: function(){
            var deferred = $q.defer();
            db.query('default', 'sites', {include_docs: true})
                .success(function(res){
                    deferred.resolve(_.map(res.rows, function(row, idx){
                        return db.getQueryDoc(idx);
                    }));
                })
                .error(function(err){
                    deferred.reject(err.reason);
                });
            return deferred.promise;
        },
        removeCustomSite: function(site){
            // TODO Implement
        },
        loadCustomizedSites: function(){
            var deferred = $q.defer();
            db.query('default', 'customsites', {include_docs: true, key: auth.loggedInUser._id})
                .success(function(res){
                    deferred.resolve(_.map(res.rows, function(row, idx){
                        return db.getQueryDoc(idx);
                    }));
                })
                .error(function(err){
                    deferred.reject(err.reason);
                });
            return deferred.promise;
        },
        saveCustomSite: function(site){
            var deferred = $q.defer();
            if(!site._id){
                site = db.newDoc(site);
            }
            site.save().success(function(){
                deferred.resolve(site);
            }).error(function(err){
                deferred.reject(err.reason);
            })
            return deferred.promise;
        },
        getCustomSite: function(customsiteId){
            var deferred = $q.defer();
            var customSite = db.newDoc();
            customSite.load(customsiteId).success(function(){
                deferred.resolve(customSite);
            }).error(function(err){
                deferred.reject(err.reason);
            });
            return deferred.promise;
        }
    }
}]);

customsite.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/customSite', {templateUrl: 'partials/customsite.html', controller: 'customSitesCtrl'});
    $routeProvider.when('/customSite/:customsiteId', {templateUrl: 'partials/customsite.html', controller: 'customSiteCtrl'});
    // Custom symbol management
}]);
