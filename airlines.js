module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getAirlines(res, mysql, context, complete){
        mysql.pool.query("SELECT IATA_code, name, departure_terminal FROM airlines", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.airlines = results;
            complete();
        });
    }


    /*Display all people. Requires web based javascript to delete users with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
	context.jsscripts = ["delete.js", "search.js"];
        //context.jsscripts = ["deleteperson.js","filterpeople.js","searchpeople.js"];
        var mysql = req.app.get('mysql');
        getAirlines(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('airline', context);
            }

        }
    });

    

    //UPDATE
    router.get('/:IATA_code', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["updateAirlines.js"];
            var mysql = req.app.get('mysql');
            getDest(res, mysql, context, req.params.IATA_code, complete);
            function complete(){
                callbackCount++;
                if(callbackCount >= 1){
                    res.render('update-airlines', context);
                }
    
            }
        });
    
        function getDest(res, mysql, context, IATA_code, complete){
            var sql = "SELECT IATA_code, name, departure_terminal FROM airlines WHERE IATA_code =?";
            var inserts = [IATA_code];
            mysql.pool.query(sql, inserts, function(error, results, fields){
                if(error){
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.airlines = results[0];
                complete();
            });
        }
       
        router.put('/:IATA_code', function(req, res){
            var mysql = req.app.get('mysql');
            var sql = "UPDATE airlines SET IATA_code=?, name=?, departure_terminal=?  WHERE IATA_code=?";
            var inserts = [req.body.IATA_code, req.body.name, req.body.departure_terminal, req.params.IATA_code];
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


        //SEARCH and FILTER
function searchD(req, res, mysql, context, complete) {
    var query = "SELECT IATA_code, name, departure_terminal FROM airlines WHERE name LIKE " + mysql.pool.escape(req.params.s + '%');
    console.log(query)
    mysql.pool.query(query, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.airlines = results;
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
                    res.render('airline', context);
                }
            }
        });











    /* Adds a person, redirects to the people page after adding */
    router.post('/', function(req, res){
   //     console.log(req.body.homeworld)
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO airlines (IATA_code, name, departure_terminal) VALUES (?,?,?)";
        var inserts = [req.body.iata, req.body.name, req.body.terminal];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/airline/');
            }
        });
    });


    /* Route to delete a person, simply returns a 202 upon success. Ajax will handle this. */
    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM airlines WHERE IATA_code = ?";
	console.log(req.params.id);
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
