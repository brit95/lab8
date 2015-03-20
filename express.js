var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var url = require('url');
var app = express();
var bodyParser = require('body-parser');
var basicAuth = require('basic-auth-connect');
var auth = basicAuth(function(user, pass) {
	return((user ==='cs360')&&(pass === 'test'));
});
var privateKey = fs.readFileSync('ssl/server.key','utf8');
var certificate = fs.readFileSync('ssl/server.crt','utf8');
var credentials = {key: privateKey, cert: certificate};
var options = {
    key: fs.readFileSync('ssl/server.key','utf8'),
    cert: fs.readFileSync('ssl/server.crt','utf8'),
    ca: fs.readFileSync('ssl/server.crt','utf8')
};
http.createServer(app).listen(80);
//https.createServer(credentials, app).listen(443);
https.createServer(options, function(req,res) {
	res.writeHead(200);
	res.end("Hi from HTTPS");
}).listen(443);
app.get('/', function (req, res) {
	res.send("Get Index");
});

app.use('/', express.static('./html', {maxAge: 60*60*1000}));
app.get('/getcity', function (req, res) {
    console.log("In getcity route");
    var urlObj = url.parse(req.url,true,false);
    var query = urlObj.query["q"];
	fs.readFile('cities.dat.txt', function (err, data) {
	if(err) throw err;
	var jsonresult = [];
	if(query!=null)
	{
		cities = data.toString().split("\n");
		for(var i = 0; i < cities.length; i++) {
				if(cities[i].substring(0,query.length) == query) {
				//console.log(cities[i]);
				jsonresult.push({city:cities[i]});
			}
		}
	}
	//console.log(jsonresult);
	res.writeHead(200);
	res.end(JSON.stringify(jsonresult));
	});
});
app.use(bodyParser.json());
app.get('/comments',function(req, res) {
	console.log("In comment route");
	// Read all of the database entries and return them in a JSON array
	var MongoClient = require('mongodb').MongoClient;
	MongoClient.connect("mongodb://localhost/weather", function(err, db) {
		if(err) throw err;
		db.collection("comments", function(err, comments) {
			if(err) throw err;
			comments.find(function(err, items) {
				items.toArray(function(err, itemArr) {
					//console.log("Document Array: ");
					//console.log(itemArr);
					res.writeHead(200);
					res.end(JSON.stringify(itemArr));
				});
			});
		});
	});
});
app.post('/comments', auth, function(req, res) {
	console.log("In POST comment route");
	console.log(req.user);
    console.log("Remote User");
    console.log(req.remoteUser);
    
    //console.log(req.body.Name);
    //console.log(req.body.Comment);
    
	res.writeHead(200);
	res.end();

	var MongoClient = require('mongodb').MongoClient;
	MongoClient.connect("mongodb://localhost/weather",function(err, db) {
		if(err) throw err;
		db.collection('comments').insert(req.body,function(err, records) {
			//console.log("Record added as "+records[0]._id);
		});
	});
});