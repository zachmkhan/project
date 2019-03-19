
function deleteFlight(type){
    var flight = document.getElementById('flight').value;
    $.ajax({
        url: '/'+ type + '/flight/' + flight,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};
