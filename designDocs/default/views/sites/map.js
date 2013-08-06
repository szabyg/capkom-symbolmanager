function(doc) {
    if(doc.type === 'site'){
        emit(doc.creator, doc);
    }
}