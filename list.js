function getPList(page) {
    //get the id of the selected table from the filter dropdown
    var person_id = document.getElementById('getList').value
    window.location = '/passenger-pilot/' + page + '/' +  encodeURI(person_id)
}