var express = require('express');
var path = require('path');
var hbs = require('hbs');
var fs = require('fs');
var favicon = require('serve-favicon');
var notesPath;
var projectData;

fs.readFile(__dirname +'/src/projects/data.json', 'utf8', function(err, data){
  if (err) throw err;
  projectData = JSON.parse(data);
});

fs.readdir(__dirname +'/notes', function(err, files){
  if (err) throw err;
  notesPath = files.map(function(f){return f.split('.')[0]});
});


var app = module.exports = express();
var routes = require('./routes');

app.set('views', path.join(__dirname,'/views'));
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);



hbs.registerPartial('topbar', fs.readFileSync(__dirname + '/views/topbar.html', 'utf8'));
hbs.registerPartial('ga', fs.readFileSync(__dirname + '/views/ga.html', 'utf8'));
hbs.registerPartial('copy', fs.readFileSync(__dirname + '/views/copy.html', 'utf8'));

app.use(favicon(__dirname + '/public/img/favicon.ico'));

app.get('/', function(req, res, next) { routes.root(req,res,next) });
app.get('/notes', function(req, res, next) { routes.notes(req,res,next) });
app.get('/projects', function(req, res, next) { routes.projects(req,res,next,projectData) });

app.use(checknotes)
app.use('/builds',express.static(path.join(__dirname + '/builds')));
app.use(express.static(path.join(__dirname + '/public')));

app.use(notfound);

app.listen(process.env.PORT || 5000);
console.log('listening on port 5000');

/*
 FUNCTIONS
*/
function checknotes (req, res, next){

  //if the request has file extension, move next (= static file)
  if(req.url.split('.').length>2) return next();

  var dir = req.url.split('/');
  var article = dir[2].split('?')[0]
  if(dir[1] === 'notes' && notesPath.indexOf(article) !== -1) return routes.notes(req,res,next,article);
  if(dir[1] === 'notes' && notesPath.indexOf(dir[2]) === -1) return notfound(req,res,next);

  return next();
}

function notfound (req, res, next){
  res.status(404);
  // respond with html page
  if (req.accepts('html')) return res.render('404',{
    'css': [{'path': '/builds/main'}],
  });

  // respond with json
  if (req.accepts('json')) return res.send({ error: 'Not found' });

  // default to plain-text. send()
  return res.type('txt').send('Page Not found');
}