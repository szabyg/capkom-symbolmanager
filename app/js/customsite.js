var customsite = angular.module('CustomSite', ['Backend']);

customsite.controller('customSiteCtrl', ['$scope', '$routeParams', '$log', '$location', 'auth', 'customsiteProvider',
function($scope, $routeParams, $log, $location, auth, customsiteProvider){

    $scope._ = 'customSiteCtrl';
    $scope.$routeParams = $routeParams;

    $scope.$watch('$routeParams.customsiteId', function(){
        if($routeParams.customsiteId){
            customsiteProvider.getCustomSite($routeParams.customsiteId).then(function(customSite){
                $scope.customSite = customSite;
                $scope.infoMsg($scope, 'Custom site loaded');
            }, function(errMsg){
                $scope.errorMsg(errMsg);
            });
        } else {
            // If this is list mode, load customizable sites
            customsiteProvider.loadCustomizableSites().then(function(sites){
                $scope.sites = sites;
            }, function(errMsg){
                $scope.errorMsg(errMsg);
            });
            // ... and the ones that are customized
            customsiteProvider.loadCustomizedSites().then(function(customSites){
                $scope.customizedSites = {};
                _.each(customSites, function(customSite){
                    $scope.customizedSites[customSite.site] = customSite;
                });
            }, function(errMsg){
                $scope.errorMsg(errMsg);
            })
        }
    });
    $scope.customize = function(site) {
        if(!!$scope.customizedSites[site._id]){
            $location.path('/customSite/' + $scope.customizedSites[site._id]._id);
        } else {
            customsiteProvider.saveCustomSite({
                type: 'customSite',
                creationDate: Date(),
                owner: auth.loggedInUser._id,
                site: site._id
            }).then(function(customSite){
                $location.path('/customSite/' + customSite._id);
            }, function(errMsg){
                $scope.errorMsg(errMsg);
            });
        }
    };

    $scope.isCustomized = function(site){
        return !!$scope.customizedSites[site._id];
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
                deferred.reject(err.reason);
            });
            return deferred.promise;
        },
        isCustomized: function(site){

        }
    }
}]);
