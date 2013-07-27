// A site is a website consisting of a url, name and an array of symbols.

var sites = angular.module('sites', ['backend']);

sites.factory('sitesProvider', ['db', 'auth', function(db, auth){
    return {
        createSite: function(site, success){
            var doc = db.newDoc({
                type: 'site'
            });
            return doc;
        },
        getSites: function(success, error){
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
            // db.queryAll().success(success);
        }
    }
}]);

sites.controller('sitesCtrl', ['$scope', 'sitesProvider', function($scope, sitesProvider){
    $scope.newSite = sitesProvider.createSite();

    $scope.refresh = function(){
        sitesProvider.getSites(function(res){
            $scope.sites = res;
        });
    };
    $scope.createSite = function(site){
        for(var prop in site){
            $scope.newSite[prop] = site[prop];
        }
        $scope.newSite.creator = $scope.auth.loggedInUser.name;
        $scope.newSite.creationTime = Date();
        console.info($scope.newSite);
        $scope.newSite.save().success(function(){
            console.info('success');
            for(var prop in site){site[prop] = '';}
            $scope.hide();
            $scope.refresh();
        });

    }
    $scope.refresh();

}]);