function(doc) {
    if(doc.type === 'customSymbol'){
        emit(doc.owner, doc);
    }
}