var app = require('../server');

app.get('/path', function(req, res) {
  res.send(200);
});
