window.WebSocket = window.WebSocket || window.MozWebSocket;

var ws = new WebSocket(ws_protocol+"://"+ws_ip+":"+ws_port+"/");

var cameras = [ ];

var selectedCamera = 0;

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
      var frameHolder = new Object();
      var frames = [ ];

      frameHolder.frame = obj.cameraFrame;
      frameHolder.date = new Date();

      frames.push(frameHolder);

      currentCamera.frames = frames;
      currentCamera.name = obj.cameraName;
      currentCamera.type = obj.cameraType;
      cameras.push(currentCamera);
    }

    if(seekCameraInList(obj.cameraName)){
      var currentCamera = seekCameraInList(obj.cameraName);
      var frames = currentCamera.frames;
      var frameHolder = new Object();
      frameHolder.date = new Date();
      frameHolder.frame = obj.cameraFrame;

      frames.push(frameHolder);
      currentCamera.type = obj.cameraType;
    }else{
      var currentCamera = new Object();
      var frames = [ ];

      var frameHolder = new Object();
      frameHolder.date = new Date();
      frameHolder.frame = obj.cameraFrame;

      frames.push(frameHolder);

      currentCamera.name = obj.cameraName;
      currentCamera.frames = frames;
      currentCamera.type = obj.cameraType;
      cameras.push(currentCamera);
    }

      for (var i=0; i < cameras.length; i++) {
        var cameraframe = document.getElementById("img" + i);
        var frames = cameras[i].frames;
        cameraframe.src = frames[frames.length-1].frame;

        // Dirty workaround for sending text inside prepared div
        var theDiv = document.getElementById("textCameraInfo"+i);

        // Avoid unset camera name or type
        if(cameras[i].name == null || cameras[i].name == "")cameras[i].name="Unset";
        if(cameras[i].type == null || cameras[i].type == "")cameras[i].type="Unset";
        var new_row = document.createElement('div');
        new_row.className = "cameraStatus";
        var camName = document.createTextNode(cameras[i].name);
        var camType = document.createTextNode(cameras[i].type);
        var br = document.createElement("br");
        while (theDiv.hasChildNodes())theDiv.removeChild(theDiv.lastChild);
        theDiv.appendChild(new_row);
        theDiv.appendChild(camName);
        theDiv.appendChild(br);
        theDiv.appendChild(camType);
      }
};

ws.ontext = function(text){
    img.src=text[image];
};

function seekCameraInList(incName) {
  for (var i=0, l=cameras.length; i<l; i++) {
    if (typeof cameras[i] == "object" && cameras[i].name === incName) {
      return cameras[i];
    }
  }
  return false;
}

function updateSelectedCameras(){
  var divs = document.getElementById("gridView").getElementsByTagName("div");
  for(var i = 0; i < divs.length; i++){
    if(divs[i]==selectedCamera){
      divs[i].style.border = "1px solid #686182";
      divs[i].style.backgroundColor = "#284365";
    }else if(divs[i].id.indexOf('div')===-1){
      // Select all divs not containing 'div' in id field
    }else{
      divs[i].style.border = "1px solid #281122";
      divs[i].style.backgroundColor = "#29324c";
    }
  }
}

function checkCameraStatus(){
    for (var i=0; i < cameras.length; i++) {
      var currentFrame = cameras[i].frames;
      console.log(currentFrame);
    }
  setTimeout(checkCameraStatus, 5000);
}

checkCameraStatus();

function setSelectedCamera(camera){
  selectedCamera = document.getElementById(camera);
  updateSelectedCameras();
}

function getSelectedCamera(){
  return selectedCamera;
}

function getSelectedCameraframes(){
  return selectedCamera.getElementsByTagName('img')[0];
}

