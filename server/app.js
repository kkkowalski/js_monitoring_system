var http = require('http');
var fs = require('fs');
var ws = require('nodejs-websocket');
var sys = require("sys");
var path = require('path');

// Create websocket server
var ws_server = ws.createServer(function (conn) {
    console.log("New connection")
    conn.on("binary", function (inStream) {
        // Empty buffer for collecting binary data
        var data = new Buffer(0)
        // Read chunks of binary data and add to the buffer
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

/**
 * Setup simple http server to serve static page elements on port 8000
 */
http.createServer(function (request, response) {

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


/*
// Handle WebSocket Requests
ws_server.addListener("connection", function(conn){

//add listener to rebroadcast incomming messages
  conn.addEventListener("message", function(msg){
	console.log('message');
        conn.broadcast(msg);
    });
});

ws_server.addListener("error", function(){
  console.log(Array.prototype.join.call(arguments, ", "));
});


ws_server.addListener("disconnected", function(conn){
  ws_server.broadcast("<"+conn.id+"> disconnected");
});

//start websocket server on port 8001
ws_server.listen(8001);
*/