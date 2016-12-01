exports.projects = function(req, res, next, data){
  res.render('projects',{
    'css': [{'path': '/builds/main'}, {'path': '/builds/projects'}],
    'data': data
    }
  );
};

exports.root = function(req, res, next){
  res.render('root',{
    'css': [{'path': '/builds/main'}],
  });
};

exports.notes = function(req, res, next, article){
  if(article){
    res.render('../notes/'+article,{
      'css': [{'path': '/builds/main'},{'path': '/builds/notes'}],
    });
  }else{
    res.render('notes',{
      'css': [{'path': '/builds/main'}],
    });
  }
};

require('./path');
