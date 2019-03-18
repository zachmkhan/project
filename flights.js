module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getPlanes(res, mysql, context, complete){
        mysql.pool.query("SELECT id FROM planes", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.planes = results;
            complete();
        });
    }

    function getAirlines(res, mysql, context, complete){
        mysql.pool.query("SELECT IATA_code, name FROM airlines", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.airlines = results;
            complete();
        });
    }

    function getDestinations(res, mysql, context, complete){
        mysql.pool.query("SELECT id, city FROM destinations", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.destinations = results;
            complete();
        });
    }


    function getFlights(res, mysql, context, complete){
        mysql.pool.query("SELECT CONCAT(airline_designator, flight_number) AS flight_number, departure_time, arrival_time, destinations.city AS destination, plane FROM flights INNER JOIN destinations ON destinations.id = flights.destination", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.flights = results;
            complete();
        });
    }


    function getFlight(res, mysql, context, id, complete){
        var sql = "SELECT airline_designator, flight_number, departure_time, arrival_time, destination, plane FROM flights WHERE CONCAT(airline_designator, flight_number) = ?";
	var inserts = [id];
	mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.flight = results[0];
            complete();
        });
    }

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
	context.jsscripts = ["delete.js"];
        var mysql = req.app.get('mysql');
        getPlanes(res, mysql, context, complete);
        getAirlines(res, mysql, context, complete);
        getDestinations(res, mysql, context, complete);
        getFlights(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 4){
                res.render('flight', context);
            }

        }
    });

    router.post('/', function(req, res){
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO flights (airline_designator, flight_number, departure_time, arrival_time, destination, plane) VALUES (?,?,?,?,?,?)";
        var inserts = [req.body.airline, req.body.flight, req.body.departure, req.body.arrival, req.body.destination, req.body.plane];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/flight/');
            }
        });
    });

        router.get('/:id', function(req, res){
            var callbackCount = 0;
            var context = {};
            context.jsscripts = ["update.js", "select.js"];
                var mysql = req.app.get('mysql');
                getFlight(res, mysql, context, req.params.id, complete);
                getPlanes(res, mysql, context, complete);
                getDestinations(res, mysql, context, complete);
                getAirlines(res, mysql, context, complete);
                function complete(){
                    callbackCount++;
                    if(callbackCount >= 4){
		  	console.log(context.flight.arrival_time);
                        res.render('update-flight', context);
                    }
        
                }
	});

            router.put('/:id', function(req, res){
                var mysql = req.app.get('mysql');
                var sql = "UPDATE flights SET airline_designator=?, flight_number=?, departure_time=?, arrival_time=?, destination=?, plane = ? WHERE airline_designator = ? AND flight_number = ?"; 
                var inserts = [req.body.airline, req.body.flight, req.body.departure, req.body.arrival, req.body.destination, req.body.plane, req.body.airline, req.body.flight];
                sql = mysql.pool.query(sql,inserts,function(error, results, fields){
                    if(error){
                        res.write(JSON.stringify(error));
                        res.end();
                    }else{
                        res.status(200);
                        res.end();
                    }
                });
	});

    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM flights WHERE CONCAT(airline_designator, flight_number) = ?";
        var inserts = [req.params.id];
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