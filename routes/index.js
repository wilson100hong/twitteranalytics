
/*
 * GET home page.
 */

var TITLE = "Confertable"; 

exports.index = function(req, res){
  res.render('index', { title: TITLE });
};
