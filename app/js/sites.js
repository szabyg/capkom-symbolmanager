// A site is a website consisting of a url, name and an array of symbols.

var sites = angular.module('sites', ['backend']);

sites.factory('sitesProvider', ['db', 'auth', function(db, auth){
    return {
        createSite: function(site, success){
            var doc = db.newDoc({
                type: 'site',
                symbols: []
            });
            return doc;
        },
        getSites: function(success, error){
            db.query('default', 'sites', {include_docs: false, key: auth.loggedInUser.name})
                .success(function(res){
                    success(_.map(res.rows, function(row, idx){
                        return db.getQueryDoc(idx);
                    }));
                })
                .error(function(err){
                    error(err);
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
                    success(res);
                });

            // db.queryAll().success(success);
        }
    }
}]);

sites.controller('sitesCtrl', ['$scope', 'sitesProvider', 'db', '$location', '$routeParams', function($scope, sitesProvider, db, $location, $routeParams){
    $scope.error = $scope.info = '';
    $scope.newSite = sitesProvider.createSite();

    if($routeParams.siteId){
        $scope.site = db.newDoc();
        $scope.site.load($routeParams.siteId);
    }

    $scope.refresh = function(){
        sitesProvider.getSites(function(res){
            $scope.sites = res;
            console.info('sites', res);
        });
    };
    $scope.saveSite = function(site){
        for(var prop in site){
            $scope.newSite[prop] = site[prop];
        }
        $scope.newSite.creator = $scope.auth.loggedInUser.name;
        $scope.newSite.creationTime = Date();
        console.info($scope.newSite);
        $scope.newSite.save().success(function(){
            console.info('success');
            for(var prop in site){site[prop] = '';}
            $location.path('');
        });
    };
    $scope.$watch('auth.loggedInUser.name', function(){
        if($scope.auth.loggedInUser && $scope.auth.loggedInUser.name){
            $scope.refresh();
        } else {
            $scope.sites = null;
        }
    });
    $scope.removeSite = function(site){
        console.info('remove', site);
        var answer = confirm('Are you sure you would like to remove the entire site settings?');
        if(answer){
            site.remove()
                .success(function(){
                    $scope.sites = _($scope.sites).without(site);
                    $scope.info = 'Successfully deleted ' + site.name;
                }).error(function(err){
                    $scope.error = err.reason;
                })
        }
    };

    $scope.newSymbol = db.newDoc({
        site: $scope.site._id
    });
    $scope.saveSymbol = function(symbol){
        console.info('To be implemented next: Save symbol', symbol);
    }
}]);
