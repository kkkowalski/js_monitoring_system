var videoId = 'video',
scaleFactor = 0.5,
snapshot = null,
upload_image,
video = document.getElementsByTagName('video')[0],
heading = document.getElementsByTagName('h1')[0];

var active = false;

window.WebSocket = window.WebSocket || window.MozWebSocket;

var ws = new WebSocket(ws_protocol+"://"+ws_ip+":"+ws_port+"/");

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

function shoot() {
    var output = document.getElementById('output');
    var canvas = capture(video, scaleFactor);
    canvas.onclick = function(){
        window.open(this.toDataURL());
    };

    $('#photos').live('pageshow',function(){
        $('#output').html(canvas);
        upload_image = canvas.toDataURL();
    });

    $.mobile.changePage('#photos');
}

function supportsToDataURL() {
    var c = document.createElement("canvas");
    var data = c.toDataURL("image/png");
    return (data.indexOf("data:image/png") == 0);
}

button = document.getElementById('button');

ws.onopen = function() {
    console.log('Websocket Open');
};

ws.onclose = function() {
    console.log('Websocket Closed');
};

ws.onerror = function(event) {
    console.log('error');
};

ws.onmessage = function(event) {
    console.log('message');
};

ws.ontext = function(event) {
    console.log('text');
};

document.getElementById("button").addEventListener('click', changeActiveState, false);

function changeActiveState() {
  if(active){
    active=false;
    document.getElementById("button").value="Start Streaming";
  }else{
    active=true;
    document.getElementById("button").value="Stop Streaming";
    streamFrame();
  }
}

function streamFrame(){

    var context = canvas.getContext("2d");
    var cameraName = document.getElementsByName("BoxCameraName")[0].value;
    var RadiocameraType = document.getElementsByName("BoxCameraType")[0];
        var cameraType = "";
        for (var i = 0; i < RadiocameraType.length; i++) {
            if (RadiocameraType[i].checked) {
                cameraType = RadiocameraType[i].value;
            }
        }

    setInterval(function(){
      if(active){
        context.drawImage(video, 0, 0, 240, 320);
        var image = canvas.toDataURL("image/png");
        ws.send(JSON.stringify({ cameraType: cameraType , cameraName: cameraName, cameraFrame: image }));
      }
    },400);
  }

navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);
   if (navigator.getUserMedia) {
    navigator.getUserMedia({
      video:true,
      audio:false
    },
    function(stream) {
      var url = window.URL || window.webkitURL;
      video.src = url ? url.createObjectURL(stream) : stream;
      video.play();
    },
    function(error) {
      heading.textContent ="An error occurred: [CODE " + error.code + "]";
    }
    )} else {
      alert('Sorry, the browser you are using doesn\'t support getUserMedia');
    }

if(!supportsToDataURL()) {
    heading.textContent+="You browser does NOT support Canvas.toDataURL();"
}
