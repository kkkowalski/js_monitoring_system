var videoId = 'video',
scaleFactor = 0.5,
snapshot = null,
upload_image,
video = document.getElementsByTagName('video')[0],
heading = document.getElementsByTagName('h1')[0];
var ws = new WebSocket("wss://"+ws_ip+":"+ws_port+"/");

function capture(video, scaleFactor) {
    var w = video.videoWidth * scaleFactor;
    var h = video.videoHeight * scaleFactor;
    var canvas = document.createElement('canvas');
    canvas.width  = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);
    return canvas;
}

function shoot(){
    var output = document.getElementById('output');
    var canvas = capture(video, scaleFactor);
    canvas.onclick = function(){
        window.open(this.toDataURL());
    };

    //load the photo when the new page opens
    $('#photos').live('pageshow',function(){
        $('#output').html(canvas);
        upload_image = canvas.toDataURL();
    });

    //load the photos page
    $.mobile.changePage('#photos');
}

function supportsToDataURL()
{
    var c = document.createElement("canvas");
    var data = c.toDataURL("image/png");
    return (data.indexOf("data:image/png") == 0);
}

navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);
   if (navigator.getUserMedia) {
      navigator.getUserMedia(
         {
            video:true,
            audio:true
         },
         function(stream) {
          var url = window.URL || window.webkitURL;
            video.src = url ? url.createObjectURL(stream) : stream;
            video.play();
         },
         function(error) { heading.textContent ="An error occurred: [CODE " + error.code + "]"; }
      );
   }
   else {
      alert('Sorry, the browser you are using doesn\'t support getUserMedia');
    }

if(!supportsToDataURL())
{
    heading.textContent+="You browser is lame and does NOT support Canvas.toDataURL();"
}


button = document.getElementById('button');

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

ws.onmessage = function(event)
{
    console.log('message');
};

addEventListener('click', streamFrame, false);

function streamFrame()
{
    var context = canvas.getContext("2d");

    setInterval(function(){
        context.drawImage(video, 0, 0, 240, 320);
        var image = canvas.toDataURL("image/png");
        console.log(image);
        console.log('send');
        ws.send(image);

    },400);
}
