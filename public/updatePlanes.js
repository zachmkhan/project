function updatePlanes(id){
    $.ajax({
        url: '/plane/' + id,
        type: 'PUT',
        data: $('#update-planes').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};