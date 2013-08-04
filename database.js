var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;

var EventEmitter = require('events').EventEmitter;
var dbEmitter = new EventEmitter();

var col = {};
var db;

var ARTIST_ARRAY = 'artist_property';
var ALL_TWEET = 'all_tweet';

exports.init = function() {

  MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db_){
    if (err) {
      throw err;
    }

    db_.collection(ALL_TWEET, function(err, col_){
      db = db_;
      col.tweet = col_;
      dbEmitter.emit("db-ready-tweet");
    });

    db_.collection(ARTIST_ARRAY, function(err, col_){
      db = db_;
      col.artist = col_;
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

  if (col.artist === undefined) {
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

    col.artist.findOne({artist: p.artist}, function(err, doc){
      if (doc) {
        col.artist.update({artist: p.artist}, {$inc: {score: p.score, count: p.count}}, function(err, docs){
          if (err) console.warn(err.message);
        });
      } else {
        col.artist.insert(p, function(err, docs){
          if (err) console.warn(err.message);
        });
      }
    });

  }
}

exports.queryall = function(callback) {
  col.artist.find({}).toArray(function(err, docs){
    docs.forEach(function(elem, index, array){
      docs[index].rating = (elem.score / elem.count) / 2 + 0.5;
    });
    callback(docs);
  });
}

exports.draw = function(artist, callback) {
  if (col.tweet == undefined) {
    dbEmitter.on("db-ready-tweet", function(stream){
      realDraw(artist, callback);
    });
  } else {
    realDraw(artist, callback);
  }
}

var realDraw = function(artist, callback) {
  col.tweet.find({artist: artist}).toArray(function(err, docs){
    var n = docs.length;
    if (n > 0){
      var rand = Math.floor(Math.random()*n);
      console.log("Lottery Luck guy:");
      console.log(docs[rand]);
      var ch = docs[rand];
      var obj = {text: ch.text, name: ch.user.name, screen_name: ch.user.screen_name, phrase: ch.phrase, created_at: ch.created_at};
      callback(obj);
    } else {
      callback({text: "", name:"", screen_name:""});
    }
  });
}

exports.log = function(doc) {
  if (col.tweet == undefined) {
    dbEmitter.on("db-ready-tweet", function(stream){
      realLog(doc);
    });
  } else {
    realLog(doc);
  }
}

var realLog = function(doc) {
  col.tweet.insert(doc, function(err, docs){
    if (err) console.warn(err.message);
  });
}
