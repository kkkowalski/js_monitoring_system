window.WebSocket = window.WebSocket || window.MozWebSocket;

var ws = new WebSocket(ws_protocol+"://"+ws_ip+":"+ws_port+"/");

var cameras = [ ];

ws.onopen = function(){
    console.log('Websocket Open');
};

ws.onclose = function(){
    console.log('Websocket Closed');
    cameras = [ ];
};

ws.onerror = function(event){
    console.log('error');
};

ws.onmessage = function(message){
    var obj = JSON.parse(message.data);

    if(cameras.length<1){
      var currentCamera = new Object();
      currentCamera.name = obj["cameraName"];
      currentCamera.frame = obj["cameraFrame"];
      currentCamera.type = obj["cameraType"];
      currentCamera.origin = message.origin;
      cameras.push(currentCamera);
    }

    if(seekCameraInList(obj["origin"])){
      var currentCamera = seekCameraInList(obj["cameraName"]);
      currentCamera.frame = obj["cameraFrame"];
      currentCamera.type = obj["cameraType"];
    }else{
      var currentCamera = new Object();
      currentCamera.name = obj["cameraName"];
      currentCamera.frame = obj["cameraFrame"];
      currentCamera.type = obj["cameraType"];
      currentCamera.origin = message.origin;
      cameras.push(currentCamera);
    }

    for (var i=0; i < cameras.length; i++) {
      var cameraframe = document.getElementById("img" + i);
      if(cameraframe)cameraframe.src = cameras[i].frame;

      // Dirty workaround for sending text inside prepared div
      var theDiv = document.getElementById("textCameraInfo"+i);

      // Avoid unset camera name or type
      if(cameras[i].name == null || cameras[i].name == "")cameras[i].name="Unset";
      if(cameras[i].type == null || cameras[i].type == "")cameras[i].type="Unset";
      if(cameras[i].origin == null || cameras[i].origin == "")cameras[i].origin="Unset";

      var camName = document.createTextNode(cameras[i].name +" "+cameras[i].type +" "+cameras[i].origin);
      while (theDiv.hasChildNodes())theDiv.removeChild(theDiv.lastChild);
      theDiv.appendChild(camName);
    }

};

ws.ontext = function(text){
    img.src=text[image];
    console.log(text[image]);
};

function seekCameraInList(origin) {
  for (var i=0, l=cameras.length; i<l; i++) {
    if (typeof cameras[i] == "object" && cameras[i].cameraIp === origin) {
      console.log(cameras[i]);
      return cameras[i];
    }
  }
  return false;
}
