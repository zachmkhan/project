function updatePassengers(id){
    $.ajax({
        url: '/passenger/' + id,
        type: 'PUT',
        data: $('#update-passengers').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};