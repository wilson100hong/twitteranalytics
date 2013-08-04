var database = require('./database');


exports.lottery = function(req, res) {
  // 1. Retrive artist
  var artist = req.query.artist;
  
  // 2. Database get all tweets for that artist
  
  // 3. Randomly pick a not-yet winning guy
  
  
  
  // 4. Send response
	res.render('meeting', model);
  
};