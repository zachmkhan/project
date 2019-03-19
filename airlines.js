module.exports = function(){
    var express = require('express');
    var router = express.Router();

/*
    function getPlanets(res, mysql, context, complete){
        mysql.pool.query("SELECT planet_id as id, name FROM bsg_planets", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.planets  = results;
            complete();
        });
    }
*/
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

    function getAirline(res, mysql, context, id, complete){
        var sql = "SELECT IATA_code, name, departure_terminal FROM airlines WHERE IATA_code = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.airline = results[0];
            complete();
        });
}
/*
    function getPeoplebyHomeworld(req, res, mysql, context, complete){
      var query = "SELECT bsg_people.character_id as id, fname, lname, bsg_planets.name AS homeworld, age FROM bsg_people INNER JOIN bsg_planets ON homeworld = bsg_planets.planet_id WHERE bsg_people.homeworld = ?";
      console.log(req.params)
      var inserts = [req.params.homeworld]
      mysql.pool.query(query, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.people = results;
            complete();
        });
    }
*/
    /* Find people whose fname starts with a given string in the req */
 /*   function getPeopleWithNameLike(req, res, mysql, context, complete) { */
      //sanitize the input as well as include the % character
   /* var query = "SELECT bsg_people.character_id as id, fname, lname, bsg_planets.name AS homeworld, age FROM bsg_people INNER JOIN bsg_planets ON homeworld = bsg_planets.planet_id WHERE bsg_people.fname LIKE " + mysql.pool.escape(req.params.s + '%');
      console.log(query)
      mysql.pool.query(query, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.people = results;
            complete();
        });
    }
     
    function getPerson(res, mysql, context, id, complete){
        var sql = "SELECT character_id as id, fname, lname, homeworld, age FROM bsg_people WHERE character_id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.person = results[0];
            complete();
        });
    } */

    /*Display all people. Requires web based javascript to delete users with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
	context.jsscripts = ["delete.js", "search.js"];
        var mysql = req.app.get('mysql');
        getAirlines(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('airline', context);
		context.message1 = "";
            }

        }
    });

    router.get('/:id', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["update.js"];
            var mysql = req.app.get('mysql');
            getAirline(res, mysql, context, req.params.id, complete);
            function complete(){
                callbackCount++;
                if(callbackCount >= 1){
                    res.render('update-airline', context);
                }
    
            }
});

function searchAirlines(req, res, mysql, context, complete) {
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
            searchAirlines(req, res, mysql, context, complete);
	    context.return = "Return to unfiltered table";
            function complete(){
                callbackCount++;
                if(callbackCount >= 1){
                    res.render('airline', context);
                }
            }
});


    /*Display all people whose name starts with a given string. Requires web based javascript to delete users with AJAX */
    router.get('/search/:s', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteperson.js","filterpeople.js","searchpeople.js"];
        var mysql = req.app.get('mysql');
        getPeopleWithNameLike(req, res, mysql, context, complete);
        getPlanets(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('people', context);
            }
        }
    });
/*

    /* Adds a person, redirects to the people page after adding */
    router.post('/', function(req, res){
	var iata = req.body.iata.toUpperCase();
	if(/^[A-Z]{2}$/.test(iata)){
	   if(/^[0-9]$/.test(req.body.terminal) && req.body.terminal <= 5){
           	var mysql = req.app.get('mysql');
       	   	var sql = "INSERT INTO airlines (IATA_code, name, departure_terminal) VALUES (?,?,?)";
           	var inserts = [iata, req.body.name, req.body.terminal];
           	sql = mysql.pool.query(sql,inserts,function(error, results, fields){
           	    if(error){
           	        console.log(JSON.stringify(error))
           	        res.write(JSON.stringify(error));
            	        res.end();
            	    }else{
           	        res.redirect('/airline');
           	    }
          	 });
	   }
	   else{
		   context = {};
		   context.message = 'Please enter a number between 1 and 5 for the airline terminal.';
		   context.table = 'airline';
		   res.render('message', context);
	   }
	}
	else{
	   context = {};
	   context.message = 'Please use an IATA code that consists of two letters.';
	   context.table = 'airline';
	   res.render('message', context);
	}
    });

        router.put('/:id', function(req, res){
	   if(/^[0-9]$/.test(req.body.departure_terminal) && req.body.departure_terminal <= 5){
        	var mysql = req.app.get('mysql');
      		var sql = "UPDATE airlines SET name=?, departure_terminal=? WHERE IATA_code=?";
        	var inserts = [req.body.name, req.body.departure_terminal, req.params.id];
     	       	sql = mysql.pool.query(sql,inserts,function(error, results, fields){
                   if(error){
                    	res.write(JSON.stringify(error));
                    	res.end();
                   }else{
                    	res.status(200);
                    	res.end();
                   }
               });
	   }
	   else{
		   context = {};
		   context.message = 'Please retry using a number between 1 and 5 for the airline terminal.';
		   context.table = 'airline';
		   res.render('message', context);
	   }
});

    /* The URI that update data is sent to in order to update a person */


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
