var modal = document.getElementById('myModal');
var modalVid = document.getElementById("vid01");
var modalVidSrc = modalVid.getElementsByTagName("source");
modalVidSrc = modalVidSrc[0];
var captionText = document.getElementById("caption");

var span = document.getElementsByClassName("close")[0];

span.onclick = function() {
  modal.style.display = "none";
};

function openModalCam(id){
  var thisVidDiv = document.getElementById(id);
  var thisVidSrc = thisVidDiv.getElementsByTagName("source");
  thisVidSrc = thisVidSrc[0];
  console.log(modalVidSrc)
  modal.style.display = "block";
  modalVidSrc.alt = thisVidSrc.alt;
  captionText.innerHTML = "CAM";
  console.log(modalVidSrc);
}
