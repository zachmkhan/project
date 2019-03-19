module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getPassengers(res, mysql, context, complete){
        mysql.pool.query("SELECT id, first_name, last_name, number_of_visits, CONCAT(airline, flight_number) AS flight FROM passengers", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.passengers = results;
            complete();
        });
    }

    function getPilots(res, mysql, context, complete){
        mysql.pool.query("SELECT id, first_name, last_name, employer, CONCAT(airline, flight_number) AS flight FROM pilots", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.pilots = results;
            complete();
        });
    }

    function getFlights(res, mysql, context, complete){
        mysql.pool.query("SELECT CONCAT(airline_designator, flight_number) AS flight, departure_time FROM flights", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.flights = results;
            complete();
        });
    }

  function getAllFlights(res, mysql, context, complete){
        mysql.pool.query("SELECT DISTINCT CONCAT(airline, flight_number) AS flights, departure FROM passenger_pilot ORDER BY flights", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.all_flights = results;
            complete();
        });
    }


    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
	context.jsscripts = ["list.js", "empty.js", "deleteflight.js"];
        var mysql = req.app.get('mysql');
        getPassengers(res, mysql, context, complete);
        getPilots(res, mysql, context, complete);
        getFlights(res, mysql, context, complete);	
        getAllFlights(res, mysql, context, complete);	
        function complete(){
            callbackCount++;
            if(callbackCount >= 4){
                res.render('passenger-pilot', context);
            }

        }
    });

            function getPilotList(req, res, mysql, context, complete){
                var query = "SELECT DISTINCT PI.first_name, PI.last_name, PP.departure, CONCAT(PP.airline, PP.flight_number) AS flight, PA.first_name AS pa_fname, PA.last_name AS pa_lname FROM passengers PA INNER JOIN passenger_pilot PP ON PA.id = PP.passenger INNER JOIN pilots PI ON PI.id = PP.pilot WHERE PA.id = ?";
                var inserts = [req.params.id]
                mysql.pool.query(query, inserts, function(error, results, fields){
                      if(error){
                          res.write(JSON.stringify(error));
                          res.end();
                      }
                      context.pilots = results;
                      complete();
                  });
              }

            function getPassengerList(req, res, mysql, context, complete){
                var query = "SELECT DISTINCT PA.first_name, PA.last_name, PP.departure, CONCAT(PP.airline, PP.flight_number) AS flight, PI.first_name AS pi_fname, PI.last_name AS pi_lname FROM passengers PA INNER JOIN passenger_pilot PP ON PA.id = PP.passenger INNER JOIN pilots PI ON PI.id = PP.pilot WHERE PI.id = ?";
                var inserts = [req.params.id]
                mysql.pool.query(query, inserts, function(error, results, fields){
                      if(error){
                          res.write(JSON.stringify(error));
                          res.end();
                      }
                      context.passengers = results;
                      complete();
                  });
              }

    router.get('/pilot/:id', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["list.js"];
        var mysql = req.app.get('mysql');
        getPilotList(req, res, mysql, context, complete);
	context.return = "Return to passenger-pilot table";
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('pilot-list', context);
            }

        }
});

   router.get('/passenger/:id', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["list.js", "empty.js"];
        var mysql = req.app.get('mysql');
        getPassengerList(req, res, mysql, context, complete);
	context.return = "Return to passenger-pilot table";
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('passenger-list', context);
            }

        }
});

    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO passenger_pilot (passenger, pilot, airline, flight_number, departure) SELECT PAS.id, PIL.id, PAS.airline, PAS.flight_number, F.departure_time FROM passengers PAS INNER JOIN pilots PIL ON PAS.airline = PIL.airline AND PAS.flight_number = PIL.flight_number INNER JOIN flights F ON PAS.airline = F.airline_designator AND PAS.flight_number = F.flight_number WHERE F.airline_designator = ? AND F.flight_number = ?";
        var inserts = [req.body.current_flight.substring(0,2), req.body.current_flight.substring(2)];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/passenger-pilot');
            }
        });
    });


   router.get('/delete_flight/:flight', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["list.js"];
        var mysql = req.app.get('mysql');
        getPilotList(req, res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('pilot-list', context);
            }

        }
});

    router.delete('/flight/:flight', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM passenger_pilot WHERE CONCAT(airline, flight_number) = ?";
	console.log(req.params.flight);
        var inserts = [req.params.flight];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }else{
                res.status(202).end();
            }
        })
    })

    return router;
}();