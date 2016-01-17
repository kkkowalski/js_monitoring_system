var express = require('express');
var http = require('http');
var https = require('https');
var fs = require('fs');
var ws = require('nodejs-websocket');
var sys = require("sys");
var path = require('path');

var options = {
  secure: true,
  key: fs.readFileSync('key/localhost.pem'),
  cert: fs.readFileSync('key/localhost.cert')
};
var ws_server = ws.createServer(options,function (conn) {
    console.log("New connection")
    conn.on("binary", function (inStream) {
        var data = new Buffer(0)
        inStream.on("readable", function () {
            var newData = inStream.read()
            if (newData)
                data = Buffer.concat([data, newData], data.length+newData.length)
        })
        inStream.on("end", function () {
            console.log("Received " + data.length + " bytes of binary data")
            process_my_data(data)
        })
    })
    conn.on("message", function(msg){
			console.log('message');
		   conn.broadcast(msg);
		    });

    conn.on("error", function(){
		  console.log(Array.prototype.join.call(arguments, ", "));
		});

    conn.on("close", function (code, reason) {
        console.log("Connection closed")
    })
}).listen(8001)

https.createServer(options,function (request, response) {
  console.log('request starting...');

	var filePath = '.' + request.url;
	if (filePath == './')
		filePath = './index.html';

	var extname = path.extname(filePath);
	var contentType = 'text/html';
	switch (extname) {
		case '.js':
			contentType = 'text/javascript';
			break;
		case '.css':
			contentType = 'text/css';
			break;
	}

	fs.exists(filePath, function(exists) {

		if (exists) {
			fs.readFile(filePath, function(error, content) {
				if (error) {
					response.writeHead(500);
					response.end();
				}
				else {
					response.writeHead(200, { 'Content-Type': contentType });
					response.end(content, 'utf-8');
				}
			});
		}
		else {
			response.writeHead(404);
			response.end();
		}
	});

}).listen(8000);
