
function updateRow(type, id){
    $.ajax({
        url: '/' + type + '/' + id,
        type: 'PUT',
        data: $('#update-' + type).serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};