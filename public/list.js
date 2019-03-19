function getPList(page) {
    //get the id of the selected table from the filter dropdown
    var person_id = document.getElementById('getList').value
    window.location = '/' + page + '/list/' +  encodeURI(person_id)
}