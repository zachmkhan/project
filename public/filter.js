function filterSQL(page) {
    //get the id of the selected homeworld from the filter dropdown
    var homeworld_id = document.getElementById('homeworld_filter').value
    //construct the URL and redirect to it
    console.log(homeworld_filter);
    window.location = '/' + page + '/filter/' +  encodeURI(homeworld_id)
}