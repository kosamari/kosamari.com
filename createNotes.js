var https = require('https');
var fs = require('fs');
var md = require('markdown-it')();

var gistID = process.argv[2]
var template;

fs.readFile('./views/note_template.html','utf8', function (err, data) {
  if (err) throw err;
  template = data;
  var options = {
    host: 'api.github.com',
    path: '/gists/'+gistID,
    headers: {'user-agent': 'nodescript'}
  };

  https.request(options, function(response) {
    var str = '';
    var obj, html, date;

    response.on('data', function (chunk) {
      str += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
      obj = JSON.parse(str);
      html = md.render(obj.files[Object.keys(obj.files)[0]].content);
      filename = obj.files[Object.keys(obj.files)[0]].filename.split('.')[0];
      date = new Date(obj.created_at)
      template = template
                  .replace(/{{date}}/g,date.toISOString().split('T')[0])
                  .replace('{{content}}',html)
                  .replace('{{title}}', filename.split('-').join(' '))
                  .replace('{{description}}', obj.description)
      fs.writeFile('./notes/'+filename+'.html', template , function (err) {
        if (err) throw err;
        console.log('post created: ' +filename);
      });
    });
  }).end();
});


