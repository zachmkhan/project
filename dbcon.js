var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_titovf',
  password        : '4132',
  database        : 'cs340_titovf'
});
module.exports.pool = pool;
