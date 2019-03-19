function getPaList() {
    //get the id of the selected table from the filter dropdown
    var person_id = document.getElementById('getPassengerList').value
    window.location = '/passenger-pilot/passenger/' +  encodeURI(person_id)
}

function getPiList() {
    //get the id of the selected table from the filter dropdown
    var person_id = document.getElementById('getPilotList').value
    window.location = '/passenger-pilot/pilot/' +  encodeURI(person_id)
}