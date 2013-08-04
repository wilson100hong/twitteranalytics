
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

exports.lottery = function(req, res) {
  var artist = req.query.artist;
  db.draw(artist, function(lucky){
    res.send(JSON.stringify(lucky));
  });
}
