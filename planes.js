module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getPlanes(res, mysql, context, complete){
        mysql.pool.query("SELECT id, airlines.name AS airline, model FROM planes INNER JOIN airlines WHERE airlines.IATA_code = planes.airline", function(error, results, fields){
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

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
	context.jsscripts = ["delete.js", "search.js"];
        var mysql = req.app.get('mysql');
        getPlanes(res, mysql, context, complete);
        getAirlines(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('plane', context);
            }

        }
    });





        //UPDATE
        router.get('/:id', function(req, res){
            var callbackCount = 0;
            var context = {};
            context.jsscripts = ["updatePlanes.js"];
                var mysql = req.app.get('mysql');
                getP(res, mysql, context, req.params.id, complete);
                getAirlines(res, mysql, context, complete);
                function complete(){
                    callbackCount++;
                    if(callbackCount >= 2){ //Might need to be 2
                        res.render('update-planes', context);
                    }
        
                }
            });
        
            function getP(res, mysql, context, id, complete){
                var sql = "SELECT id, airline, model FROM planes WHERE id = ?";
                var inserts = [id];
                mysql.pool.query(sql, inserts, function(error, results, fields){
                    if(error){
                        res.write(JSON.stringify(error));
                        res.end();
                    }
                    context.planes = results[0];
                    complete();
                });
            }
           
            router.put('/:id', function(req, res){
                var mysql = req.app.get('mysql');
                var sql = "UPDATE planes SET airline=?, model=? WHERE id=?";
                var inserts = [req.body.airline, req.body.model, req.params.id];
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
        var query = "SELECT id, airlines.name AS airline, model FROM planes INNER JOIN airlines ON airlines.IATA_code = planes.airline WHERE airlines.name LIKE " + mysql.pool.escape(req.params.s + '%');
        console.log(query)
        mysql.pool.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.planes = results;
            complete();
            });
        }
    
            /*Display all people whose name starts with a given string. Requires web based javascript to delete users with AJAX */
            router.get('/search/:s', function(req, res){
                //console.log("debug1");
                var callbackCount = 0;
                var context = {};
                context.jsscripts = ["search.js"];
                var mysql = req.app.get('mysql');
                //console.log("debug2");
                searchD(req, res, mysql, context, complete);
                //getAirlines(req,res, mysql, context, complete);
                //getPlanes(res, mysql, context, complete);
                function complete(){
                    callbackCount++;
                    if(callbackCount >= 1){
                        res.render('plane', context);
                    }
                }
            });




    router.post('/', function(req, res){
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO planes (airline, model) VALUES (?,?)";
        var inserts = [req.body.airline, req.body.model];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/plane/');
            }
        });
    });

    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM planes WHERE id = ?";
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