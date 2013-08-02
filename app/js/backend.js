// The backend module sets up the communication facilities to the back end using CornerCouch.

var backend = angular.module('Backend', ['CornerCouch', 'Users']);

// server is the couchdb server
backend.factory('server', ['cornercouch', function(cornercouch){
//    return cornercouch('http://szaby.iriscouch.com', 'JSONP');
    return cornercouch('/couchdb');
}]);

// db is the database
backend.factory('db', ['$q', 'server', function($q, server){
    var db = server.getDB('csm'),
        docPromises = {};
    db.getDocs = function(docIdArray){
        var res = [], i, id;
        for(i in docIdArray){
            id = docIdArray[i];
            res.push(this.getDoc(id));
        }
        return $q.all(res);
    };
    db.getDoc = function(docId){
        if(docPromises[docId]){
            return docPromises[docId];
        } else {
            var deferred = $q.defer();
            var doc = db.newDoc(), res;
            docPromises[docId] = deferred.promise;

            doc.load(docId).success(function(){
                deferred.resolve(doc);
            }).error(function(err){
                deferred.reject(err.reason);
            });
            return docPromises[docId];
        }
    };
    db.saveDoc = function(doc){
        var deferred = $q.defer();
        if(!doc._id){
            doc = db.newDoc(doc);
        }
        doc.save().success(function(){
            deferred.resolve(doc);
        }).error(function(err){
                deferred.reject(err.reason);
        })
        return deferred.promise;
    };

    return db;
}])


