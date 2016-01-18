window.WebSocket = window.WebSocket || window.MozWebSocket;

var ws = new WebSocket("wss://"+ws_ip+":"+ws_port+"/");

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
      cameras.push(currentCamera);
    }

    if(seekCameraInList(obj["cameraName"])){
      var currentCamera = seekCameraInList(obj["cameraName"]);
      currentCamera.frame = obj["cameraFrame"];
      currentCamera.type = obj["cameraType"];
    }else{
      var currentCamera = new Object();
      currentCamera.name = obj["cameraName"];
      currentCamera.frame = obj["cameraFrame"];
      currentCamera.type = obj["cameraType"];
      cameras.push(currentCamera);
    }

    for (var i=0; i < cameras.length; i++) {
      var cameraframe = document.getElementById("img" + i);
      cameraframe.src = cameras[i].frame;

      // Dirty workaround for sending text inside prepared div
      var theDiv = document.getElementById("textCameraInfo"+i);

      // Avoid unset camera name or type
      if(cameras[i].name == null || cameras[i].name == "")cameras[i].name="Unset";
      if(cameras[i].type == null || cameras[i].type == "")cameras[i].type="Unset";

      var camName = document.createTextNode(cameras[i].name +" "+cameras[i].type);
      while (theDiv.hasChildNodes())theDiv.removeChild(theDiv.lastChild);
      theDiv.appendChild(camName);
    }

};

ws.ontext = function(text){
    img.src=text[image];
    console.log(text[image]);
};

function seekCameraInList(name) {
  for (var i=0, l=cameras.length; i<l; i++) {
    if (typeof cameras[i] == "object" && cameras[i].name === name) {
      console.log(cameras[i]);
      return cameras[i];
    }
  }
  return false;
}
