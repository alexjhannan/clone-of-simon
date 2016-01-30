var express = require('express');
var app = express();

app.use(express.static('client'));

app.get('/', function(req, res){
	res.sendFile('index.html');
});

var server = app.listen(process.env.PORT || 3000, function(){
	console.log('Listening on port %s', server.address().port);
});
