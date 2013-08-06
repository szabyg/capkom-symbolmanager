function(doc) {
    if(doc.type === 'customSite'){
        emit(doc.owner, doc);
    }
}