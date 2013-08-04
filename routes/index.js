
/*
 * GET home page.
 */

var TITLE = "Confertable"; 

var db = require("../database");

exports.index = function(req, res){
  res.render('index', { title: TITLE });
};

exports.queryall = function(req, res) {
  db.queryall(function(docs) {
    res.send(JSON.stringify(docs));
  });
};
