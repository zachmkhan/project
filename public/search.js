function searchSQL(temp) {
    //Key is the originating webpage
    var searchName  = document.getElementById('searchName').value
    window.location = '/'+temp+'/search/' + encodeURI(searchName)
}