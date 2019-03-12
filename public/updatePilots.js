function updatePilots(id){
    $.ajax({
        url: '/pilot/' + id,
        type: 'PUT',
        data: $('#update-pilots').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};