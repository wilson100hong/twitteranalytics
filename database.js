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

exports.update = function(arg) {
	console.log("update");
	console.log(arg);
}