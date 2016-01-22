"use strict";

process.title = 'node-monitoring-system';

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

var clients = [ ];

var ws_server = ws.createServer(options, function (conn) {
  console.log((new Date()) + "WSS  Peer " + conn.socket.remoteAddress + " connected.");
  var index = clients.push(conn) - 1;

  var ip = conn.remoteAddress;

  conn.on("text", function (str) {
    console.log((new Date()) + "Received frame from: "+conn.socket.remoteAddress);
    conn.sendText(str.toUpperCase());
    if(clients.length>0){
      for (var i=0; i < clients.length; i++) {
        if(clients[i]!=null)
        clients[i].sendText(str);
      }
    }
  })

  conn.on("close", function (code, reason) {
    console.log((new Date()) + "WSS  Peer " + conn.socket.remoteAddress  + " disconnected.");
    clients[index]=null;
  })

}).listen(8001)

https.createServer(options,function (request, response) {
  console.log((new Date()) + "HTTPS  Peer " + request.socket.remoteAddress  + " connected.");

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
