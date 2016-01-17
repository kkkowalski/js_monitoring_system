window.WebSocket = window.WebSocket || window.MozWebSocket;

var ws = new WebSocket("wss://"+ws_ip+":"+ws_port+"/");

var img = document.getElementById('img');

ws.onopen = function()
{
    console.log('Websocket Open');
};

ws.onclose = function()
{
    console.log('Websocket Closed');
};

ws.onerror = function(event)
{
    console.log('error');
};

ws.onmessage = function(message)
{
    img.src=message.data;
    console.log(img);
};

ws.ontext = function(text)
{
    img.src=text.data;
    console.log(text);
};
