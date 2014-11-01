var app = require('../server');

app.get('/path', function(req, res) {
  res.send(200);
});

app.get('/fluent/video', function (req, res) {
  res.render('video');
});