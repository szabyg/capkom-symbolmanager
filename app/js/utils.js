var utils = angular.module('Utils', []);
utils.factory('utils', [function(){
    return {
        clean: function(obj){
            for(var prop in obj){obj[prop] = '';}
        }
    };
}])