var customsite = angular.module('CustomSite', ['Backend']);

customsite.controller('customSitesCtrl', ['$scope', '$routeParams', '$log', '$location', 'customsiteProvider',
function($scope, $routeParams, $log, $location, customsiteProvider){

    $scope._ = 'customSitesCtrl';
    $scope.$routeParams = $routeParams;

    var errFn = function(errMsg){$scope.errorMsg($scope, errMsg);};

    // load customizable sites
    $scope.$watch('auth.loggedInUser.name', function(){
        if($scope.auth.loggedInUser && $scope.auth.loggedInUser.name){
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
customsite.controller('customSiteCtrl', ['$scope', '$routeParams', '$log', '$location', 'siteProvider', 'symbolProvider', 'customsiteProvider', 'customSymbolProvider',
function($scope, $routeParams, $log, $location, siteProvider, symbolProvider, customsiteProvider, customSymbolProvider){

    $scope._ = 'customSiteCtrl';
    var errFn = function(errMsg){$scope.errorMsg($scope, errMsg);};

    // Load custom site
    $scope.$watch('auth.loggedInUser.name', function(){
        if($scope.auth.loggedInUser && $scope.auth.loggedInUser.name){
            customsiteProvider.getCustomSite($routeParams.customsiteId).then(function(customSite){
                $scope.customSite = customSite;

                customSymbolProvider.getCustomSymbols($scope.customSite.symbols).then(function(customSymbols){
                    $scope.customSymbols = {};
                    _.each(customSymbols, function(customSymbol){
                        $scope.customSymbols[customSymbol.origSymbol] = customSymbol;
                    });

//                    $scope.customSymbols[customSymbol.origSymbol] = origSymbolHash[customSymbol.origSymbol];
//                    var origSymbolIds = _.map(customSymbols, function(customSymbol){
//                        return customSymbol.origSymbol;
//                    });
//                    symbolProvider.getSymbols(origSymbolIds).then(function(origSymbols){
//                        var origSymbolHash = {};
//                        _.each(origSymbols, function(origSymbol){
//                            origSymbolHash[origSymbol._id] = origSymbol;
//                        });
//                        _.each(customSymbols, function(customSymbol){
//                            $scope.customSymbols[customSymbol.origSymbol] = origSymbolHash[customSymbol.origSymbol];
//                        })
//                    })
//                    });
                }, errFn);

                // Load base site
                siteProvider.getSite($scope.customSite.site).then(function(site){
                    $scope.site = site;

                    // Load base symbols
                    symbolProvider.getSymbols($scope.site.symbols).then(function(symbols){
                        $scope.symbols = symbols;
                    }, errFn)
                }, errFn);
                $log.info('Custom site loaded');
            }, function(errMsg){
                $scope.errorMsg($scope, errMsg);
                $location.path('/')
            });
        }
    });

    $scope.isCustomized = function(symbol){
        return !!$scope.customSymbols[symbol._id];
    };

    $scope.customize = function(symbol){
        if($scope.customSymbols[symbol._id]){
            $location.path('/customizeSymbol/' + $scope.customSymbols[symbol._id]._id);
        } else {
            customSymbolProvider.saveCustomSymbol({
                type: 'customSymbol',
                site: $scope.site._id,
                customSite: $scope.customSite._id,
                owner: $scope.auth.loggedInUser._id,
                creationDate: Date(),
                origSymbol: symbol._id
            }).then(function(customSymbol){
                $scope.customSite.symbols.push(customSymbol._id);
                $scope.customSite.save().success(function(){
                    $location.path('/customizeSymbol/' + customSymbol._id);
                });
            })
        }
    };

    $scope.getCustomSymbol = function(symbol){
        return $scope.customSymbols[symbol._id];
    }
}]);

customsite.controller('customSymbolCtrl', ['$scope', '$routeParams', '$log', '$location', 'siteProvider', 'symbolProvider', 'customsiteProvider', 'customSymbolProvider',
function($scope, $routeParams, $log, $location, siteProvider, symbolProvider, customsiteProvider, customSymbolProvider){

    $scope._ = 'customSymbolCtrl';
    var errFn = function(errMsg){$scope.errorMsg($scope, errMsg);};

    // load $scope.customSymbol, origSymbol
    customSymbolProvider.getCustomSymbol($routeParams.symbolId).then(function(customSymbol){
        symbolProvider.getSymbol(customSymbol.origSymbol).then(function(origSymbol){
            $scope.origSymbol = origSymbol;
        }, errFn);
        $scope.customSymbol = customSymbol;
    }, errFn);
    $scope.removeCustomization = function(){
        var customSiteId = $scope.customSymbol.customSite;
        $scope.customSymbol.remove();
        delete $scope.customSymbol;
        $location.path('/customSite/' + customSiteId);
    };
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
                deferred.reject(err || 'Not found.');
            });
            return deferred.promise;
        }
    }
}]);

customsite.config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/customSite', {templateUrl: 'partials/customsite.html', controller: 'customSitesCtrl'});
    $routeProvider.when('/customSite/:customsiteId', {templateUrl: 'partials/customsite.html', controller: 'customSiteCtrl'});
    $routeProvider.when('/customizeSymbol/:symbolId', {templateUrl: 'partials/customsymbol.html', controller: 'customSymbolCtrl'});
    // Custom symbol management
}]);
