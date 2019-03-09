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

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
	context.jsscripts = ["delete.js"];
        var mysql = req.app.get('mysql');
        getPassengers(res, mysql, context, complete);
        getFlights(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('passenger', context);
            }

        }
    });

    router.post('/', function(req, res){
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO passengers (first_name, last_name, number_of_visits, airline, flight_number) VALUES (?,?,?,?,?)";
        var inserts = [req.body.fname, req.body.lname, 1, req.body.flight.substring(0,2), req.body.flight.substring(2)];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/passenger');
            }
        });
    });

    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM passengers WHERE id = ?";
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