
MotionDetector = {};
MotionDetector.WebCamCapture = function(videoElement) {

    var webCamWindow = false;
    var width = 640;
    var height = 480;

    function initialize(videoElement) {
        if(typeof videoElement != 'object') {
            webCamWindow = document.getElementById(videoElement);
        } else {
            webCamWindow = videoElement;
        }

        if(hasSupport()) {
            if(webCamWindow) {
                webCamWindow.style.width = width + 'px';
                webCamWindow.style.height = height + 'px';
                startStream();
            }

        } else {
            alert('No support found');
        }
    }

    function startStream() {
        (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia).call(
            navigator,
            {video: true},
            function(localMediaStream) {
                if(webCamWindow) {
                    var vendorURL = window.URL || window.webkitURL;

                    if (navigator.mozGetUserMedia) {
                        webCamWindow.mozSrcObject = localMediaStream;
                        webCamWindow.play();
                    } else {
                        webCamWindow.src = vendorURL.createObjectURL(localMediaStream);
                    }
                }
            },
            console.error
        );
    }

    function captureImage(append) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(webCamWindow, 0, 0, width, height);

        var pngImage = canvas.toDataURL("image/png");

        if(append) {
            append.appendChild(canvas);
        }

        return canvas;
    }

    function setSize(w, h) {
        width = w;
        height = h;
    }

    function hasSupport(){
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia);
    }

    initialize(videoElement);

    return {
        setSize: setSize,
        hasSupport: hasSupport,
        captureImage: captureImage
    };

}

MotionDetector.ImageCompare = function() {
    var sensitivity, temp1Canvas, temp1Context, temp2Canvas, temp2Context, topLeft, bottomRight;

    function initialize() {
        sensitivity = 40;

        if(!temp1Canvas) {
            temp1Canvas = document.createElement('canvas');
            temp1Context = temp1Canvas.getContext("2d");
        }

        if(!temp2Canvas) {
            temp2Canvas = document.createElement('canvas');
            temp2Context = temp2Canvas.getContext("2d");
        }

        topLeft = [Infinity,Infinity];
        bottomRight = [0,0];
    }

    function compare(image1, image2, width, height) {
        initialize();

        if(!image1 || !image2) {
            return;
        }

        temp1Context.clearRect(0,0,100000,100000);
        temp1Context.clearRect(0,0,100000,100000);

        temp1Context.drawImage(image1, 0, 0, width, height);
        temp2Context.drawImage(image2, 0, 0, width, height);


        for(var y = 0; y < height; y++) {
            for(var x = 0; x <  width; x++) {
                var pixel1 = temp1Context.getImageData(x,y,1,1);
                var pixel1Data = pixel1.data;

                var pixel2 = temp2Context.getImageData(x,y,1,1);
                var pixel2Data = pixel2.data;

                if(comparePixel(pixel1Data, pixel2Data) == false) {
                    setTopLeft(x,y);
                    setBottomRight(x,y);
                }
            }
        }

        return {
            'topLeft': topLeft,
            'bottomRight': bottomRight
        }
    }

    function comparePixel(p1, p2) {
        var matches = true;

        for(var i = 0; i < p1.length; i++) {
            var t1 = Math.round(p1[i]/10)*10;
            var t2 = Math.round(p2[i]/10)*10;

            if(t1 != t2) {
                if((t1+sensitivity < t2 || t1-sensitivity > t2)) {
                    matches = false;
                }
            }
        }

        return matches;
    }


    function setTopLeft(x,y) {
        if(x < topLeft[0] ) {
            topLeft[0] = x;
        }
        if(y < topLeft[1]) {
            topLeft[1] = [y];
        }
    }

    function setBottomRight(x,y) {
        if(x > bottomRight[0]) {
            bottomRight[0] = [x];
        }
        if(y > bottomRight[1]) {
            bottomRight[1] = [y];
        }
    }

    initialize();

    return {
        compare: compare
    }
};

MotionDetector.Core = function() {

    var rendering = false;

    var width = 64;
    var height = 48;

    var webCam = null;
    var imageCompare = null;

    var currentImage = null;
    var oldImage = null;

    var topLeft = [Infinity,Infinity];
    var bottomRight = [0,0];

    var raf = (function(){
        return  window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
            function( callback ){
                window.setTimeout(callback, 1000/60);
            };
    })();

    function initialize() {
        imageCompare = new MotionDetector.ImageCompare();
        webCam = new MotionDetector.WebCamCapture(document.getElementById('webCamWindow'));

        rendering = true;

        main();
    }

    function render() {
        oldImage = currentImage;
        currentImage = webCam.captureImage(false);

        if(!oldImage || !currentImage) {
            return;
        }

        var vals = imageCompare.compare(currentImage, oldImage, width, height);

        topLeft[0] = vals.topLeft[0] * 10;
        topLeft[1] = vals.topLeft[1] * 10;

        bottomRight[0] = vals.bottomRight[0] * 10;
        bottomRight[1] = vals.bottomRight[1] * 10;

        document.getElementById('movement').style.top = topLeft[1] + 'px';
        document.getElementById('movement').style.left = topLeft[0] + 'px';

        document.getElementById('movement').style.width = (bottomRight[0] - topLeft[0]) + 'px';
        document.getElementById('movement').style.height = (bottomRight[1] - topLeft[1]) + 'px';

        topLeft = [Infinity,Infinity];
        bottomRight = [0,0]

    }

    function main() {
        try{
            render();
        } catch(e) {
            console.log(e);
            return;
        }

        if(rendering == true) {
            raf(main.bind(this));
        }
    }

    initialize();
};

var core = new MotionDetector.Core();