//
//Copyright (c) 2015, Priologic Software Inc.
//All rights reserved.
//
//Redistribution and use in source and binary forms, with or without
//modification, are permitted provided that the following conditions are met:
//
//    * Redistributions of source code must retain the above copyright notice,
//      this list of conditions and the following disclaimer.
//    * Redistributions in binary form must reproduce the above copyright
//      notice, this list of conditions and the following disclaimer in the
//      documentation and/or other materials provided with the distribution.
//
//THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
//AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
//IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
//ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
//LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
//CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
//SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
//INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
//CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
//ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
//POSSIBILITY OF SUCH DAMAGE.
//
var selfEasyrtcid = "";

function disable(domId) {
    document.getElementById(domId).disabled = "disabled";
}


function enable(domId) {
    document.getElementById(domId).disabled = "";
}


function connect() {
    easyrtc.enableDebug(false);
    console.log("Initializing.");
    easyrtc.enableAudio(false);
    easyrtc.enableAudioReceive(false);
    easyrtc.setRoomOccupantListener(convertListToButtons);
    easyrtc.initMediaSource(
        function(){        // success callback
            var selfVideo = document.getElementById("selfVideo");
            easyrtc.setVideoObjectSrc(selfVideo, easyrtc.getLocalStream());
            easyrtc.connect("easyrtc.videoOnly", loginSuccess, loginFailure);
        },
        function(errorCode, errmesg){
            easyrtc.showError("MEDIA-ERROR", errmesg);
        }  // failure callback
        );
    
    connectedYet = true;
}


function terminatePage() {
    easyrtc.disconnect();
}


function hangup() {
    easyrtc.hangupAll();
    disable('hangupButton');
}


function clearConnectList() {
    var otherClientDiv = document.getElementById('otherClients');
    while (otherClientDiv.hasChildNodes()) {
        otherClientDiv.removeChild(otherClientDiv.lastChild);
    }

}


function convertListToButtons (roomName, occupants, isPrimary) {
    clearConnectList();
    var otherClientDiv = document.getElementById('otherClients');
    for(var easyrtcid in occupants) {
        var button = document.createElement('button');
        button.onclick = function(easyrtcid) {
            return function() {
                performCall(easyrtcid);
            };
        }(easyrtcid);

        var label = document.createTextNode( easyrtc.idToName(easyrtcid));
        button.appendChild(label);
        otherClientDiv.appendChild(button);
    }
    if( !otherClientDiv.hasChildNodes() ) {
        otherClientDiv.innerHTML = "<em>Nobody else is on...</em>";
    }
}

function sendEvent(id, context, video, canvas, filename, resultingfilepath, imageElem) {// id never used here ...
    //alert("begin sending -2 ... ")

    context.drawImage(video, 0, 0, 320, 240);




    var image = convertCanvasToImage(canvas);

    var formData    = new FormData(),
        xhttp       = new XMLHttpRequest(),
        file        = dataURItoBlob(image.src)

    formData.append('uploads[]', file, filename)

    //image.parentElement.classList.remove('img-error')
    //image.parentElement.classList.add('img-uploading')

    xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4) {
            if(xhttp.status == 200) {
                setTimeout(showSuccess.bind(this), 1500)

                // Chu-Chi: below necessary ?

                sDetect = new Image();
                sDetect.src = resultingfilepath; // can also be a remote URL e.g. http://
                sDetect.onload = function() {
                    //console.info("resetting the source ... :)")

                    d = new Date();
                    imageElem.attr("src", sDetect.src + "?" + d.getTime());

                    //canvas.width = canvas.width;
                    //context.clearRect(0, 0, canvas.width, canvas.height);
                    //context.drawImage(sDetect,0,0, 320, 240);
                };

            } else {
                setTimeout(showError.bind(this), 1500)
            }
        }
    }.bind(this);

    xhttp.open('POST', '/upload');
    xhttp.send(formData);
}


function testingFunctionInvocation(id, context, video, canvas, filename, resultingfilepath, imageElem) {// id never used here ...
    // alert("testing id:                " + id);
    // alert("testing context:           " + context);
    // alert("testing video:             " + video);
    // alert("testing canvas:            " + canvas);
    // alert("testing filename:          " + filename);
    // alert("testing resultingfilepath: " + resultingfilepath);
    // alert("testing imageElem:         " + imageElem);



    sendEvent(id, context, video, canvas, filename, resultingfilepath)


}

var selfContextJs = "";
function setSelfContextJs(context){
    selfContextJs = context;
}

var selfVideoJs = ""
function setSelfVideoJs(video){
    selfVideoJs = video;
}

var selfCanvasJs = ""
function setSelfCanvasJs(canvas){
    selfCanvasJs = canvas;
}

var selfImageElemJs = ""
function setSelfImageElemJs(imageElem){
    selfImageElemJs = imageElem;
}

function performCall(otherEasyrtcid) {
    easyrtc.hangupAll();

    var acceptedCB = function(accepted, easyrtcid) {
        if( !accepted ) {
            easyrtc.showError("CALL-REJECTED", "Sorry, your call to " + easyrtc.idToName(easyrtcid) + " was rejected");
            enable('otherClients');
        }
    };
    var successCB = function() {
        enable('hangupButton');
    };
    var failureCB = function() {
        enable('otherClients');
    };




    // todo: write it to the server ...
    // todo: synchronusly ...
    //alert("e2e_" + document.getElementById("iam").innerHTML.substring("I am ".length) + "_" + otherEasyrtcid);// testing ...
    // todo: in upload2, cp -p remote_recognize.png ...
    // todo: then, log will be updated ...
    // todo: check the log first
    // todo: if not pass, show the popup ... otherwise, let it pass ...

    // todo:


    isInitializer = true;
    isListener    = false;
    
    
    var data = new FormData();

    //replaceAll(easyrtcid, "_", "UNDERSCORE"

    data.append("data" ,                               // called when click connect btn ...
        "e2e_"
        + replaceAll(document.getElementById("iam").innerHTML.substring("I am ".length), "_", "UNDERSCORE") 
        + "_"
        + replaceAll(otherEasyrtcid, "_", "UNDERSCORE") + "," +
        "e2e_" 
        + replaceAll(otherEasyrtcid, "_", "UNDERSCORE") 
        + "_"
        + replaceAll(document.getElementById("iam").innerHTML.substring("I am ".length), "_", "UNDERSCORE") );

    var xhr = (window.XMLHttpRequest) ? new XMLHttpRequest() : new activeXObject("Microsoft.XMLHTTP");
    xhr.open( 'post', '/mapping');                     // todo: do the same for e2e mapping ...
    xhr.send(data);


    //sleep(2000);// CHU-CHI: NOT SURE IF THIS IS NECESSARY ...


                                   if(true) {

//                                    $.get("latest/remoteRecognize.latest", function (data) {
//                                        $('#callerLog').text(data)
//                                        document.getElementById("callerLog").scrollTop = document.getElementById("callerLog").scrollHeight;
//                                    });
//
//                                    $.get("latest/remoteRecognize.log", function (data) {
//                                        $('#callerLog2').text(data)
//                                        document.getElementById("callerLog2").scrollTop = document.getElementById("callerLog2").scrollHeight;
//                                    });
//
                                   isBeginToSend = false;
                                   sendingRate = 1000;
                                   pictureSent = 0;
                                   totalPictureNeeded = 10;
//                                    listenToCookieId = ""
                                   //setInterval(function () {

                                       for(pictureSent = 0; pictureSent < totalPictureNeeded;) {

                                            alert("number of pictures being sent:   " + pictureSent);
                                            //alert("total number of pictures needed: " + totalPictureNeeded);

                                           //if(connectedYet) {
                                           if(isBeginToSend == false) {
                                               $.get("latest/c2c_" + getCookie() + ".mapping", function (data) {
                                                   if (data.endsWith(listenerFileName)) {
                                                       isBeginToSend = true;
                                                       sendingRate = 2500;
                                                       initializerId = data.substring(0, data.indexOf("_"))
                                                       //alert(""+initializerId);
//                                                listenToCookieId = data;
//                                                listenToCookieId = listenToCookieId.substring(0, listenToCookieId.indexOf("_"))
                                                   }
                                               });
                                           }

                                           //alert("after checking mapping")

                                           if (isBeginToSend && isInitializer) {// initializer keeps sending to prove himself or herself !!!

                                               //alert("begin sending ... ")

//                                        sendEvent(
//                                                callerId,
//                                                callerContext,
//                                                callerVideo,
//                                                callerCanvas,
//                                                getCookie() + "_remoteRecognize.png",
//                                                "latest/remoteRecognize.png",
//                                                $('#callerImage'));

                                               
                                               //sendEvent(selfId, selfContext, selfVideo, selfCanvas, getCookie() + "_localRecognize.png", "latest/localRecognize.png", $('#selfImage'));
                                               testingFunctionInvocation("", selfContextJs, selfVideoJs, selfCanvasJs, getCookie() + "_localRecognize.png", "latest/localRecognize.png", selfImageElemJs);
                                               //alert("begin sending 2 ... ")
                                               pictureSent = pictureSent + 1;
                                               //alert("begin sending 3 ... ")
                                               //alert("number of pictures being sent2:   " + pictureSent);

                                               isRemoteRecognizeClicked = true;
                                               isRemoteRecognizeClicked2 = true;

                                               sleep(sendingRate);
                                           }

//                                        //initializerCookieId = listenToCookieId.substring(0, listenToCookieId.indexOf("_"))
//
//                                        if (isBeginToSend && (getCookie() != listenToCookieId)){//} isListener){
//                                            $.get("latest/" + listenToCookieId + "_localRecognize.latest", function (data) {
//                                                $('#callerLog').text(data)
//                                                document.getElementById("callerLog").scrollTop = document.getElementById("callerLog").scrollHeight;
//                                            });
//                                            $.get("latest/" + listenToCookieId + "_localRecognize.log", function (data) {
//                                                $('#callerLog2').text(data)
//                                                document.getElementById("callerLog2").scrollTop = document.getElementById("callerLog2").scrollHeight;
//
//                                            });
//                                        }
                                       }
                                   //}, sendingRate);
                               }






    alert("before asyncrhronous ...");

    setTimeout(function() {

        //alert(otherEasyrtcid)

        //isBeginToSend = false;


        easyrtc.call(otherEasyrtcid, successCB, failureCB, acceptedCB);

    }, 5000);
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function loginSuccess(easyrtcid) 
{
    disable("connectButton");
    // enable("disconnectButton");
    enable('otherClients');
    selfEasyrtcid = easyrtcid;
    document.getElementById("iam").innerHTML = "I am " + easyrtcid;// + "( <-> " + getCookie() + ")";

    // todo: it's easier to be done in upload2 server !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // todo: whenver click connect, reset everything ...
    // todo: remove all the existing ones that contains cookie id here !!! in latest folder ...
    // todo: remove all the existing ones that contains corresponding easyrtc id !!! in latest folder ...









    var data = new FormData();
    data.append("data" ,                               // called when click connect btn ...
        "c2e_" + getCookie() + "_" + replaceAll(easyrtcid, "_", "UNDERSCORE") + "," + // cookie  id to easyrtc id
        "e2c_" + replaceAll(easyrtcid, "_", "UNDERSCORE") + "_" + getCookie());        // easyrtc id to cookie  id
    var xhr = (window.XMLHttpRequest) ? new XMLHttpRequest() : new activeXObject("Microsoft.XMLHTTP");
    xhr.open( 'post', '/mapping');                     // todo: do the same for e2e mapping ...
    xhr.send(data);
}


function loginFailure(errorCode, message) {
    easyrtc.showError(errorCode, message);
}


function disconnect() {
    document.getElementById("iam").innerHTML = "logged out";
    easyrtc.disconnect();
    console.log("disconnecting from server");
    enable("connectButton");
    // disable("disconnectButton");
    clearConnectList();
    easyrtc.setVideoObjectSrc(document.getElementById('selfVideo'), "");
}


easyrtc.setStreamAcceptor( function(easyrtcid, stream) {
    var video = document.getElementById('callerVideo');
    easyrtc.setVideoObjectSrc(video,stream);
    console.log("saw video from " + easyrtcid);
    enable("hangupButton");
});


easyrtc.setOnStreamClosed( function (easyrtcid) {
    easyrtc.setVideoObjectSrc(document.getElementById('callerVideo'), "");
    disable("hangupButton");
});


easyrtc.setAcceptChecker(function(easyrtcid, callback) {

    // alert("before");
    //
    // setTimeout(function() {
    //
    //     isBeginToSend = false;// NOTE: IN THE OTHER PARTY ... HENCE THIS WON'T WORK ..



        document.getElementById('acceptCallBox').style.display = "block";
        if (easyrtc.getConnectionCount() > 0) {
            document.getElementById('acceptCallLabel').innerHTML = "Drop current call and accept new from " + easyrtc.idToName(easyrtcid) + " ?";
        }
        else {
            document.getElementById('acceptCallLabel').innerHTML = "Accept incoming call from " + easyrtc.idToName(easyrtcid) + " ?";
        }
        var acceptTheCall = function (wasAccepted) {
            document.getElementById('acceptCallBox').style.display = "none";
            if (wasAccepted && easyrtc.getConnectionCount() > 0) {
                easyrtc.hangupAll();
            }
            callback(wasAccepted);
        };

        // Chu-Chi: check if the within 5 second and at least 10 picture has distance < 70
        //          if yes, call acept the call directory
        //          else execute the following ...

        //alert(easyrtcid);
        isTheCallerInTheGroup = false;


        // alert("e2e_" + document.getElementById("iam").innerHTML.substring("I am ".length) + "_" + easyrtcid);
        // easyrtcid is the other party ...
        // i need to check its confidence level before letting it pass ...
        //while(true){

        // data.append("data" , "e2c_" + replaceAll(easyrtcid, "_", "UNDRESCORE") + "_," + "c2c_" + getCookie() + "_");// use e2c to find the other party's cookie id and, then, use c2c to check whether true or false
        // var xhr = (window.XMLHttpRequest) ? new XMLHttpRequest() : new activeXObject("Microsoft.XMLHTTP");
        // xhr.open( 'post', '/connect');
        // xhr.send(data);

        //
        //alert("CONNECT " + getCookie() + " e2e_" + document.getElementById("iam").innerHTML.substring("I am ".length) + "_" + easyrtcid);
        //
        //alert("CONNECT " + xhr.responseText);
        //
        // if(xhr.responseText == "true"){
        //     isTheCallerInTheGroup = true;
        // }

        //}


        //sleep(10000);// Note: This is ok ...

        // var request = new XMLHttpRequest();
        // request.open('POST', '/connect/', false);  // `false` makes the request synchronous
        // request.send(null);
        //
        // if (request.status === 200) {
        //     alert(request.responseText);
        // } else {
        //     alert(request.responseText + "!!!");
        // }

        // while(true){
        //
        //     data.append("data" , "e2c_" + replaceAll(easyrtcid, "_", "UNDRESCORE") + "_," + "c2c_" + getCookie() + "_");// use e2c to find the other party's cookie id and, then, use c2c to check whether true or false
        //     var xhr = (window.XMLHttpRequest) ? new XMLHttpRequest() : new activeXObject("Microsoft.XMLHTTP");
        //     xhr.open( 'post', '/connect');
        //     xhr.send(data);
        //
        //     alert(request.responseText);
        // }


        if (isTheCallerInTheGroup) {
            acceptTheCall(true);// if it pass the face recognition test ...
        } else {




            document.getElementById("callAcceptButton").onclick = function () {
                acceptTheCall(true);
            };
            document.getElementById("callRejectButton").onclick = function () {
                acceptTheCall(false);
            };

        }
    //}, 10000)
} );
