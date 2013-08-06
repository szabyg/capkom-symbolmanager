function(doc) {
    if(doc.type === 'symbol'){
        emit(doc.site, doc);
    }
    if(doc.type === 'customSymbol'){
        emit(doc.site, doc);
    }
    if(doc.type === 'site'){
        emit(doc._id, doc);
    }
    if(doc.type === 'customSite'){
        emit(doc.site, doc);
    }
}