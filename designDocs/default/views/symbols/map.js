function(doc) {
    if(doc.type === 'symbol'){
        emit(doc.name, doc);
    }
}