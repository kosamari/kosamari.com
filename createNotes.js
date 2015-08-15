var https = require('https');
var fs = require('fs');
var md = require('markdown-it')();

var gistID = process.argv[2]

fs.readFile('./views/note_template.html','utf8', function (err, data) {
  if (err) throw err;
  var template = data;

  var options = {
    host: 'api.github.com',
    path: '/gists/'+gistID,
    headers: {'user-agent': 'nodescript'}
  };

  https.request(options, function(response) {
    var str = '';

    response.on('data', function (chunk) {
      str += chunk;
    });

    response.on('end', function () {
      var res = JSON.parse(str);
      var file = res.files[Object.keys(res.files)[0]];
      var html = md.render(file.content);
      var filename = file.filename.split('.')[0];
      var date = new Date(res.created_at)
      template = template
                  .replace(/{{date}}/g,date.toISOString().split('T')[0])
                  .replace('{{content}}',html)
                  .replace('{{title}}', filename.split('-').join(' '))
                  .replace('{{description}}', res.description)

      fs.writeFile('./notes/'+filename+'.html', template , function (err) {
        if (err) throw err;
        console.log('file created: ' +filename);
      });

    });
  }).end();
});