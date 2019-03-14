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

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
	context.jsscripts = ["delete.js", "search.js"];
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






    //SEARCH and FILTER
    function searchD(req, res, mysql, context, complete) {
        var query = "SELECT CONCAT(airline_designator, flight_number) AS flight_number, departure_time, arrival_time, destinations.city AS destination, plane FROM flights INNER JOIN destinations ON destinations.id = flights.destination WHERE CONCAT(airline_designator, flight_number) LIKE " + mysql.pool.escape(req.params.s + '%');
        console.log(query)
        mysql.pool.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.flights = results;
            complete();
            });
        }
    
            /*Display all people whose name starts with a given string. Requires web based javascript to delete users with AJAX */
            router.get('/search/:s', function(req, res){
                var callbackCount = 0;
                var context = {};
                context.jsscripts = ["search.js"];
                var mysql = req.app.get('mysql');
                searchD(req, res, mysql, context, complete);
                function complete(){
                    callbackCount++;
                    if(callbackCount >= 1){
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