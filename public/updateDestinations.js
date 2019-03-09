function updateDestinations(id){
    $.ajax({
        url: '/destination/' + id,
        type: 'PUT',
        data: $('#update-destinations').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};