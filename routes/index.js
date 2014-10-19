exports.apps = function(req, res, next){
  res.render('app',{
    'css': [{'path': '/builds/main'}, {'path': '/builds' + req.url}],
    'js': [{'path': '/builds/main'}, {'path': '/builds' + req.url}]
    }
  );
};

exports.root = function(req, res, next){
  res.render('root',{
    'css': [{'path': '/builds/main'}],
  });
};

require('./path');
