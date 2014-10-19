var express = require('express');
var path = require('path');
var hbs = require('hbs');
var fs = require('fs');
var appsPath;

fs.readdir(__dirname +'/src', function(err, files){
  if (err) throw err;
  appsPath = files;
});

var app = module.exports = express();
var routes = require('./routes');

app.set('view engine', 'html');
app.engine('html', require('hbs').__express);
app.use(checkapps)
app.use('/builds',express.static(path.join(__dirname + '/builds')));
app.use(express.static(path.join(__dirname + '/public')));
app.use(notfound);

app.listen(process.env.PORT || 5000);
console.log('listening on port 5000');

/*
 FUNCTIONS
*/
function checkapps (req, res, next){
  //if the request has file extension, move next (= static file)
  if(req.url.split('.').length>2) return next();
  if(req.url==='/') return routes.root(req,res,next);
  var dir = req.url.split('/');
  if(appsPath.indexOf(dir[1]) === -1) return next();
  if(dir.length>2){
    var newUrl = req.protocol + '://' + req.get('Host') + '/'+dir[1]+'#' + dir.slice(2,dir.length).join('/');
    return res.redirect(newUrl);
  }
  routes.apps(req,res,next);
}

function notfound (req, res, next){
  res.status(404);
  // respond with html page
  if (req.accepts('html')) return res.render('404');

  // respond with json
  if (req.accepts('json')) return res.send({ error: 'Not found' });

  // default to plain-text. send()
  return res.type('txt').send('Page Not found');
}