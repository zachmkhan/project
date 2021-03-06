module.exports = function(){
    var express = require('express');
    var router = express.Router();

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
        mysql.pool.query("SELECT airline_designator, flight_number FROM flights", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.flights = results;
            complete();
        });
    }



    function getAirlines(res, mysql, context, complete){
        mysql.pool.query("SELECT name FROM airlines", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.airlines = results;
            complete();
        });
    }

            function getPilot(res, mysql, context, id, complete){
                var sql = "SELECT id, first_name, last_name, employer, CONCAT(airline, flight_number) AS flight FROM pilots WHERE id=?";
                var inserts = [id];
                mysql.pool.query(sql, inserts, function(error, results, fields){
                    if(error){
                        res.write(JSON.stringify(error));
                        res.end();
                    }
                    context.pilot = results[0];
                    complete();
                });
	}

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
	context.jsscripts = ["delete.js", "filter.js","search.js", "empty.js"];
        var mysql = req.app.get('mysql');
        getPilots(res, mysql, context, complete);
        getAirlines(res, mysql, context, complete);
        getFlights(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
                res.render('pilot', context);
            }

        }
    });
                //SEARCH and FILTER
    function searchPilots(req, res, mysql, context, complete) {
        var query = "SELECT id, first_name, last_name, employer, CONCAT(airline, flight_number) AS flight FROM pilots WHERE first_name LIKE " + mysql.pool.escape(req.params.s + '%');
        console.log(query)
        mysql.pool.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.pilots = results;
            complete();
            });
        }
    
            /*Display all people whose name starts with a given string. Requires web based javascript to delete users with AJAX */
            router.get('/search/:s', function(req, res){
                var callbackCount = 0;
                var context = {};
                context.jsscripts = ["search.js", "empty.js"];
                var mysql = req.app.get('mysql');
                searchPilots(req, res, mysql, context, complete);
	        context.return = "Return to unfiltered table";
                function complete(){
                    callbackCount++;
                    if(callbackCount >= 1){
                        res.render('pilot', context);
                    }
                }
            });


            
            function getFilter(req, res, mysql, context, complete){
                var query = "SELECT id, first_name, last_name, employer, CONCAT(airline, flight_number) AS flight FROM pilots WHERE employer LIKE" + mysql.pool.escape(req.params.name + '%');
                var inserts = [req.params.name]
                mysql.pool.query(query, inserts, function(error, results, fields){
                      if(error){
                          res.write(JSON.stringify(error));
                          res.end();
                      }
                      context.pilots = results;
                      complete();
                  });
              }


                        /*Display all people from a given homeworld. Requires web based javascript to delete users with AJAX*/
    router.get('/filter/:name', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["delete.js","filter.js","search.js", "empty.js"];
        var mysql = req.app.get('mysql');
        getFilter(req,res, mysql, context, complete);
	context.return = "Return to unfiltered table";
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('pilot', context);
            }

        }
});

    router.post('/', function(req, res){
	var flight_airline;
	var flight_number;
	if (req.body.flight != "NULL"){
	    flight_airline = req.body.flight.substring(0,2);
	    flight_number = req.body.flight.substring(2);
	}
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO pilots (first_name, last_name, employer, airline, flight_number) VALUES (?,?,?,?,?)";
        var inserts = [req.body.fname, req.body.lname, req.body.employer, flight_airline, flight_number];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/pilot');
            }
        });
    });

        router.get('/:id', function(req, res){
            var callbackCount = 0;
            var context = {};
            context.jsscripts = ["update.js", "select.js", "empty.js"];
                var mysql = req.app.get('mysql');
                getPilot(res, mysql, context, req.params.id, complete);
                getFlights(res, mysql, context, complete);
                getAirlines(res, mysql, context, complete);
                function complete(){
                    callbackCount++;
                    if(callbackCount >= 3){
                        res.render('update-pilot', context);
                    }
        
                }
	});

            router.put('/:id', function(req, res){
		var flight_airline;
		var flight_number;
		if (req.body.flight != "NULL"){
		    flight_airline = req.body.flight.substring(0,2);
		    flight_number = req.body.flight.substring(2);
		}
                var mysql = req.app.get('mysql');
                var sql = "UPDATE pilots SET first_name=?, last_name=?, employer=?, airline=?, flight_number=?  WHERE id=?"; 
                var inserts = [req.body.first_name, req.body.last_name, req.body.employer, flight_airline, flight_number, req.params.id];
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
        var sql = "DELETE FROM pilots WHERE id = ?";
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
