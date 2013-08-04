// Twitter Analtics

var BUFFER_SIZE = 1;
var SENTIMENT_URL = "http://access.alchemyapi.com/calls/text/TextGetTextSentiment?outputMode=json&apikey=e3a1bfef63e1bdec1bcaf4dc8e0e8d091277f8e4&text="

var ntwitter = require('ntwitter'),
    request = require('request'),
    database = require('./database');

var buffer = [];  // operation buffer

var twit;
var default_server = true;

if (default_server) {
  twit =  new ntwitter({
    consumer_key: 'y2it3VGcR0lpmfplJWyvQ',
    consumer_secret: '0ZARGMogR6lGCDMli8eyrh2PhOm9U5WhhjHM1nz0Hzs',
    access_token_key: '1615787012-I7RTCotqwBUauGIQo7ZGS6VvfoKIKckuI0E8tUk',
    access_token_secret: 'fJzic3iSklcsIaeFBJqsFnioxLxYLxf0BusheqwMc'
  });
} else {
  twit =  new ntwitter({
    consumer_key: 'wriTmvSBALisny9r3Pki0g',
    consumer_secret: 'aryERK3OByFLHEZrNyfh0XAl7WeijoTPzKxEgnkRo',
    access_token_key: '248561777-0V3Crd611Yc0r8kX0n9nvpWrcjGT3t3sonyxZJtp',
    access_token_secret: 'EqXMEHeDkzY3ctnvJzfCCXqKPJoBNo1TcXmQzoBztAU'
  });
}

function trimHashtagOrMention(x) {
  if (x.length > 0) {
    x = x.substr(1, x.length - 1);
  }
  return x;
}

// Parse raw data to operation
function parse(data, callback) {
  console.log("Tokenize...");
  // 1. Tokenize
  var text = data["text"]
  var tokens = text.split(" ");
  
  // 2. Cateogrize into # and @ arrays
  //   a. # hashtag
  //   b. @ mention
  var hashtags = [];
  var mentions = [];
  var words = [];
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    switch(token.charAt(0)) {
      case "#":
        if (token.length > 1)
          hashtags.push(trimHashtagOrMention(token));
        break;
      case "@":
        if (token.length > 1)
          mentions.push(trimHashtagOrMention(token));
        break;
      default:
        words.push(token);
        break;
    }
  }
  
  // Log the tweet for every mentioned
  for (var i = 0; i < mentions.length; i++) {
    data["artist"] = mentions[i];
    database.log(data);
  }
  
  // 3. Sentiment Analysis comupte score. NOTE: this is async call
  // reconstruct phrase
  var phrase;
  for (var i = 0; i < words.length; i++) {
    phrase += words[i];
    phrase += " ";
  }
  // console.log("Sentiment Analyizing...");
  console.log("Sentiment Analyzing...");
  request(SENTIMENT_URL + phrase, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      // console.log("Seniment Analyzation done.");
      // console.log(body) // Print the google web page.
      /* body: {
        "docSentiment": {
           "type": "negative",
           "score": "-0.64059"
        }
      } */
      var sa = JSON.parse(body);
      console.log(sa);
      if (sa["docSentiment"] != undefined) {
        var ds = sa["docSentiment"];
        var score = 0;
        if (ds["score"] != undefined) {
          score = parseFloat(ds["score"]);
        }
        for (var i = 0; i < mentions.length; i++) {
            // { artist: mention,
            //   count:  1, 
            //   score: score }
          buffer.push({
            "artist": mentions[i],
            "count": 1,
            "score": score});
          console.log("Pushed to buffer");
        }
      }
      callback();
    } else {
      console.log(error);
    }
  })
}

function update() {
  // 1. Collapsing
  console.log("Collapsing...");
  var mapping = {};
  for (var i = 0; i < buffer.length; i++) {
    var artist = buffer[i].artist;
    var score = buffer[i].score;
    var t_count = 0;
    var t_score = 0;
    if (mapping[artist] != undefined) {
      t_count = mapping[artist].count;
      t_score = mapping[artist].score;
    }
    mapping[artist] = {"count": t_count + 1, "score" : score + t_score };   
  }
  // 2. Flatten mapping into ops
  console.log("Flattening...");
  var ops = [];
  for(var artist in mapping) {
    /* op: {
        artist:
        count: 
        score:
      } */
    ops.push({"artist" : artist, 
            "count": mapping[artist].count,
            "score": mapping[artist].score})
  }
 
  // 3. Send ops to database
  console.log("Write to database...");
  database.update(ops); 
}

exports.ingest = function(tag) {
  console.log("Ingestion Start...");

  twit.stream('statuses/filter', {'track': tag}, function(stream) {
    stream.on('data', function (data) {
      console.log(data);
      parse(data, function() {
        if (buffer.length >= BUFFER_SIZE) {
          console.log("Buffer full, doing update...");
          update();
          buffer = [];
        }
      }); // async call
      // Is buffer beyond limits?
    });
  });
}
