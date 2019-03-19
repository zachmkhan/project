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

    function getDestination(res, mysql, context, id, complete){
        var sql = "SELECT id, city, country FROM destinations WHERE id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.destination = results[0];
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

    router.get('/:id', function(req, res){
    var callbackCount = 0;
    var context = {};
	context.jsscripts = ["update.js"];
        var mysql = req.app.get('mysql');
        getDestination(res, mysql, context, req.params.id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('update-destination', context);
            }

        }
    });

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

    function searchDestinations(req, res, mysql, context, complete){
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

        router.get('/search/:s', function(req, res){
            var callbackCount = 0;
            var context = {};
            context.jsscripts = ["search.js", "delete.js"];
            var mysql = req.app.get('mysql');
            searchDestinations(req, res, mysql, context, complete);
	    context.return = "Return to unfiltered table";
            function complete(){
                callbackCount++;
                if(callbackCount >= 1){
                    res.render('destination', context);
                }
            }
	});

    router.post('/', function(req, res){
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
