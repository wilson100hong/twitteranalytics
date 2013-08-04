
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

exports.lottery_api = function(req, res) {
  var artist = req.query.artist || "noexist";
  db.draw(artist, function(lucky){
    res.send(JSON.stringify(lucky));
  });
}

exports.lottery = function(req, res) {
  var artist = req.query.artist;
  
  res.render('lottery', {"artist" : artist});
}
