var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;

var EventEmitter = require('events').EventEmitter;
var dbEmitter = new EventEmitter();

var col;
var db;

var ARTIST_ARRAY = 'artist_property';

exports.init = function() {

  MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db_){
    if (err) {
      throw err;
    }

    db_.collection(ARTIST_ARRAY, function(err, col_){
      db = db_;
      col = col_;
      console.log("connected to mongodb");
      dbEmitter.emit("db-ready");
    });

  });

}

exports.close = function() {
  if (db) {
    db.close();
  }
}

exports.update = function(arg) {

  console.log("in database.js");
  console.log(arg);

  if (col === undefined) {
    dbEmitter.on("db-ready", function(stream){
      realUpdate(arg);
    });
  } else {
    realUpdate(arg);
  }

}

var realUpdate = function(arg) {
  var len = arg.length;
  for(var i = 0; i < len; i++) {
    var p = arg[i];
    console.log(p);

    col.findOne({artist: p.artist}, function(err, doc){
      if (doc) {
        col.update({artist: p.artist}, {$inc: {score: p.score, count: p.count}}, function(err, docs){
          if (err) console.warn(err.message);
        });
      } else {
        col.insert(p, function(err, docs){
          if (err) console.warn(err.message);
        });
      }
    });

  }
}
