exports.apps = function(req, res, next){
  res.render('index',{
    'name': req.url,
    'css': [{'path': '/builds/main'}, {'path': '/builds' + req.url}],
    'js': [{'path': '/builds/main'}, {'path': '/builds' + req.url}]
    }
  );
};

exports.root = function(req, res, next){
  res.render('index',{
    'name': req.url,
    'css': [{'path': '/builds/main'}],
    'js': [{'path': '/builds/main'}]
    }
  );
};

require('./path');
