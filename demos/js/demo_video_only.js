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
        
        //popupBtn = button;// testing ...

        var label = document.createTextNode( easyrtc.idToName(easyrtcid));
        button.appendChild(label);
        otherClientDiv.appendChild(button);
    }
    if( !otherClientDiv.hasChildNodes() ) {
        otherClientDiv.innerHTML = "<em>Nobody else is on...</em>";
    }
}


function performCall(otherEasyrtcid) {



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

    if(isGoingToShowPopup == false){





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




        // todo: maybe i should be doing things here ... isWaiting = true
        // else go on ...

        //isListenerGoingToDecide = true;
        isGoingToShowPopup = true;

    } else {


        easyrtc.hangupAll();

        var acceptedCB = function (accepted, easyrtcid) {
            if (!accepted) {
                easyrtc.showError("CALL-REJECTED", "Sorry, your call to " + easyrtc.idToName(easyrtcid) + " was rejected");
                enable('otherClients');
            }
        };
        var successCB = function () {
            enable('hangupButton');
        };
        var failureCB = function () {
            enable('otherClients');
        };


        easyrtc.call(otherEasyrtcid, successCB, failureCB, acceptedCB);
    }
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
    document.getElementById('acceptCallBox').style.display = "block";
    if( easyrtc.getConnectionCount() > 0 ) {
        document.getElementById('acceptCallLabel').innerHTML = "Drop current call and accept new from " + easyrtc.idToName(easyrtcid) + " ?";
    }
    else {
        document.getElementById('acceptCallLabel').innerHTML = "Accept incoming call from " + easyrtc.idToName(easyrtcid) +  " ?";
    }
    var acceptTheCall = function(wasAccepted) {
        document.getElementById('acceptCallBox').style.display = "none";
        if( wasAccepted && easyrtc.getConnectionCount() > 0 ) {
            easyrtc.hangupAll();
        }
        callback(wasAccepted);
    };

    // Chu-Chi: check if the within 5 second and at least 10 picture has distance < 70
    //          if yes, call acept the call directory
    //          else execute the following ...

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

    document.getElementById('acceptCallBox').style.display = "none";
    //return;// pup still appear ... not no effects ...
    //setTimeout( function () {
        sleep(10000);// Note: This is ok ... change from 10s to 20s

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
    //}, 0);
} );
