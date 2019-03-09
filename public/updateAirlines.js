function updateAirlines(IATA_code){
    $.ajax({
        url: '/airline/' + IATA_code,
        type: 'PUT',
        data: $('#update-airlines').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};