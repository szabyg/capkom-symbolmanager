function(doc) {
    if(doc.type === 'symbol'){
        emit([doc.site, doc.creator], doc);
    }
    if(doc.type === 'customSymbol'){
        emit([doc.site, dpc.owner], doc);
    }
}