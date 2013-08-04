// Twitter Analtics

var ntwitter = require('ntwitter');

var twit = new ntwitter({
  consumer_key: 'y2it3VGcR0lpmfplJWyvQ',
  consumer_secret: '0ZARGMogR6lGCDMli8eyrh2PhOm9U5WhhjHM1nz0Hzs',
  access_token_key: '1615787012-I7RTCotqwBUauGIQo7ZGS6VvfoKIKckuI0E8tUk',
  access_token_secret: 'fJzic3iSklcsIaeFBJqsFnioxLxYLxf0BusheqwMc'
});



exports.ingest = function() {
  console.log("ingest");
  /*  
  twit
    .stream('statuses/sample', function(stream){
      stream.on('data', function(data){
        console.log(data);
      });
    });
  */

}