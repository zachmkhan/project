module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getDestinations(res, mysql, context, complete){
        mysql.pool.query("SELECT id, city, country FROM destinations", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.destinations = results;
            complete();
        });
    }

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
	context.jsscripts = ["delete.js", "search.js"];
        var mysql = req.app.get('mysql');
        getDestinations(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('destination', context);
            }

        }
    });


    //UPDATE
    router.get('/:id', function(req, res){
    var callbackCount = 0;
    var context = {};
	context.jsscripts = ["updateDestinations.js"];
        var mysql = req.app.get('mysql');
        getDest(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('update-destinations', context);
            }

        }
    });

    function getDest(res, mysql, context, id, complete){
        var sql = "SELECT id, city, country FROM destinations WHERE id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.destinations = results[0];
            complete();
        });
    }
   
    router.put('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE destinations SET city=?, country=? WHERE id=?";
        var inserts = [req.body.city, req.body.country, req.params.id];
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
    var query = "SELECT id, city, country FROM destinations WHERE city LIKE " + mysql.pool.escape(req.params.s + '%');
    console.log(query)
    mysql.pool.query(query, function(error, results, fields){
        if(error){
            res.write(JSON.stringify(error));
            res.end();
        }
        context.destinations = results;
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
                    res.render('destination', context);
                }
            }
        });











    router.post('/', function(req, res){
   //     console.log(req.body.homeworld)
        console.log(req.body)
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO destinations (city, country) VALUES (?,?)";
        var inserts = [req.body.city, req.body.country];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/destination/');
            }
        });
    });

    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM destinations WHERE id = ?";
        var inserts = [req.params.id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
		console.log(req.params.id);
                res.status(400);
                res.end();
            }else{
                res.status(202).end();
            }
        })
    })

    return router;
}();