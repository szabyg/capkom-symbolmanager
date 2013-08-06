function(head, req){
    var owner = req.query.owner, row, symbolMap = {}, customSymbols = [];
    var imagePrefix = "http://" + req.headers.Host + "/" + req.info.db_name + "/";

    /* This is what happens here:
     * a request like http://localhost:5984/csm/_design/default/_list/usersymbols/symbols-and-sites?key=%225ae4a27601a53ed2d353af30250088a9%22&owner=org.couchdb.user:panni
     * delivers a complete dataset for a site and for a user with all the default and overridden symbols.
     *
     * So first we look for all symbols and put them in a map.
     *
     * Then we look for all the customSymbols and if they define something, we put those things also in the map.
     *
     */
    while(row = getRow()){
        if(row.value.type === 'symbol'){
            symbolMap[row.value._id] = row.value;
            if(!row.value.fileUri){
                row.value.fileUri = imagePrefix + row.value._id + "/" + row.value.file;
            }
        }
        if(row.value.type === 'customSymbol' && row.value.owner === owner){
            customSymbols.push(row.value);
            if(!row.value.fileUri){
                row.value.fileUri = imagePrefix + row.value._id + "/" + row.value.file;
            }
        }
    }

    for(var i in customSymbols){
        var customSymbol = customSymbols[i];
        for(var prop in customSymbol){
            var value = customSymbol[prop];
            if(value && value.length){
                symbolMap[customSymbol.origSymbol][prop] = value;
            }
        }
    }
    var ret = {};
    for(var id in symbolMap){
        var symbol = symbolMap[id];
        delete symbol._id;
        delete symbol._rev;
        delete symbol._attachments;
        ret[symbol.name] = symbol;
    }

    send(JSON.stringify(ret, undefined, '  '));
}
