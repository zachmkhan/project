function searchSQL(key) {
    //Key is the originating webpage
    var searchName  = document.getElementById('searchName').value
    window.location = key +'/search/' + encodeURI(searchName)
}