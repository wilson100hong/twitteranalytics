/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , fs = require('fs')
  , path = require('path')
  , ntwitter = require('ntwitter');
var MongoClient = require('mongodb').MongoClient;
var format = require('util').format;

MongoClient.connect('mongodb://127.0.0.1:27017/test', function(err, db){
  if (err) throw err;

  var collection = db.collection('test_insert');

  collection.insert({a: 2, b: 4}, function(err, docs){

    collection.count(function(err, count){
      console.log(format("count = %s", count))
    });

    collection.find().toArray(function(err, results){
      console.dir(results);

      db.close();
    });
  });
});

/*
var twit = new ntwitter({
  consumer_key: 'y2it3VGcR0lpmfplJWyvQ',
  consumer_secret: '0ZARGMogR6lGCDMli8eyrh2PhOm9U5WhhjHM1nz0Hzs',
  access_token_key: '1615787012-I7RTCotqwBUauGIQo7ZGS6VvfoKIKckuI0E8tUk',
  access_token_secret: 'fJzic3iSklcsIaeFBJqsFnioxLxYLxf0BusheqwMc'
});

twit
  .stream('statuses/sample', function(stream){
    stream.on('data', function(data){
      console.log(data);
    });
  });
  */
var app = require('express')();

module.exports = app;
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/uWvjW5697stsers', user.list);


var history = [];

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
