// Load required modules
var http    = require("http");              // http server core module
var express = require("express");           // web framework external module
var io      = require("socket.io");         // web socket external module
var easyrtc = require("../");           // EasyRTC external module

var path = require('path');
var formidable = require('formidable');
var fs = require('fs');

const child_process = require('child_process');

// Setup and configure Express http server. Expect a subfolder called "static" to be the web root.
var httpApp = express();
httpApp.use(express.static(__dirname + "/static/"));
//var pngFileName = null;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Note: set the latest picture to the default !!!
var latestFolderAbsPath = path.join(__dirname, '../demos/latest/');
var defaultLatestFolderAbsPath = latestFolderAbsPath + 'default/';

fs.readdirSync(latestFolderAbsPath).forEach(function(file) {
    var file_path = latestFolderAbsPath+file;
    //console.log(file_path);
    var last_dot_index = file_path.lastIndexOf('.');
    //console.log(last_dot_index);
    var file_extension = file_path.substring(last_dot_index+1);
    //console.log(file_extension);



    if(file_extension == "png" || file_extension == "log" || file_extension == "latest" || file_extension == "mapping"){
        console.log("Deleting " + file_path)
        var workerProcess = child_process.exec('rm ' + file_path,
            function (error, stdout, stderr) {
                if (error) {
                    console.log(error.stack);
                    console.log('Error code: ' + error.code);
                    console.log('Signal received: ' + error.signal);
                }
                //console.log('stdout: ' + stdout);
                //console.log('stderr: ' + stderr);
            });

        workerProcess.on('exit', function (code) {
            //console.log('Child process exited with exit code ' + code);
        });
    }
});

fs.createReadStream(defaultLatestFolderAbsPath+'localSnap.png').pipe(fs.createWriteStream(latestFolderAbsPath+'localSnap.png'));
fs.createReadStream(defaultLatestFolderAbsPath+'localDetect.png').pipe(fs.createWriteStream(latestFolderAbsPath+'localDetect.png'));
fs.createReadStream(defaultLatestFolderAbsPath+'localRecognize.png').pipe(fs.createWriteStream(latestFolderAbsPath+'localRecognize.png'));
fs.createReadStream(defaultLatestFolderAbsPath+'localRecognize.log').pipe(fs.createWriteStream(latestFolderAbsPath+'localRecognize.log'));
fs.createReadStream(defaultLatestFolderAbsPath+'localRecognize.latest').pipe(fs.createWriteStream(latestFolderAbsPath+'localRecognize.latest'));
fs.createReadStream(defaultLatestFolderAbsPath+'remoteSnap.png').pipe(fs.createWriteStream(latestFolderAbsPath+'remoteSnap.png'));
fs.createReadStream(defaultLatestFolderAbsPath+'remoteDetect.png').pipe(fs.createWriteStream(latestFolderAbsPath+'remoteDetect.png'));
fs.createReadStream(defaultLatestFolderAbsPath+'remoteRecognize.png').pipe(fs.createWriteStream(latestFolderAbsPath+'remoteRecognize.png'));
fs.createReadStream(defaultLatestFolderAbsPath+'remoteRecognize.log').pipe(fs.createWriteStream(latestFolderAbsPath+'remoteRecognize.log'));
fs.createReadStream(defaultLatestFolderAbsPath+'remoteRecognize.latest').pipe(fs.createWriteStream(latestFolderAbsPath+'remoteRecognize.latest'));


// httpApp.post('/passed', function(req, res)
// {
//     var form = new formidable.IncomingForm().parse(req)
//         .on('file', function(name, file) {
//             console.log('Got file:', name);
//             res.end('success');
//         })
//         .on('field', function(name, field) {
//             console.log(' ============================================ Got a name:', name);
//             console.log(' ============================================ Got a value:', field);
//             res.end('success');
//         });
// });
























httpApp.post('/mapping', function(req, res) {
    var form = new formidable.IncomingForm().parse(req)
        .on('file', function(name, file) {
            console.log('Got file:', name);
        })
        .on('field', function(name, field) {
            console.log(' >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Got a name:', name);
            console.log(' >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Got a value:', field);
            
            if(field.split(",").length > 1) {
                fs.closeSync(fs.openSync(latestFolderAbsPath + field.split(",")[0] + ".mapping", 'w'));
                fs.closeSync(fs.openSync(latestFolderAbsPath + field.split(",")[1] + ".mapping", 'w'));
            } else {
                fs.closeSync(fs.openSync(latestFolderAbsPath + field + ".mapping", 'w'));
            }
            if(field.startsWith("e2e_")){
                from_to        = field.split(",")[0];
                from_start     = from_to.indexOf("_");
                to_start       = from_to.lastIndexOf("_");
                from_easyrtcid = from_to.substring(from_start+1, to_start);
                to_easyrtcid   = from_to.substring(to_start+1);

                console.log("Connecting from " + from_easyrtcid + " to " + to_easyrtcid);

                from_cookie = "";
                to_coookie = "";
                fs.readdirSync(latestFolderAbsPath).forEach(function(file) {

                    var last_dot_index = file.lastIndexOf('.');

                    if(file.startsWith("e2c_" + from_easyrtcid)){
                        from_cookie = file.substring(("e2c_" + from_easyrtcid).length+1, last_dot_index);
                    }
                    if(file.startsWith("e2c_" + to_easyrtcid)){
                        to_cookie = file.substring(("e2c_" + to_easyrtcid).length+1, last_dot_index);
                    }
                });
                
                console.log("Connecting from " + from_cookie + " to " + to_cookie);
                
                want_to_have_remote = from_cookie + "_localRecognize.png";
                want_to_have_name_as = to_cookie + "_remoteRecognize.png"
                var workerProcess = child_process.exec(
                    'python ' +
                    '/home/ubuntu/GitHub/face-recognition-python-opencv/generateMapping.py ' +
                    '/var/nodes/easyrtc/node_modules/easyrtc/demos/latest/ ' +  
                    want_to_have_remote + " " + want_to_have_name_as,
                    function (error, stdout, stderr) {
                        if (error) {
                            console.log(error.stack);
                            console.log('Error code: ' + error.code);
                            console.log('Signal received: ' + error.signal);
                        }
                        console.log('stdout: ' + stdout);
                        console.log('stderr: ' + stderr);
                    });
                workerProcess.on('exit', function (code) {
                    console.log('Child process exited with exit code ' + code);
                    form.on('error', function (err) {
                        console.log('error: \n' + err);
                    });
                    form.on('end', function () {
                        res.end('success');
                    });
                    form.parse(req);
                });
            }
        })
        .on('error', function(err) {
            next(err);
        })
        .on('end', function() {
            res.end();
        });
});

























httpApp.post('/upload', function(req, res){

    var form = new formidable.IncomingForm();

    form.multiples = true;
    form.uploadDir = path.join(__dirname, '/uploads');

    form.on('file', function(field, file) {

        var currentdate = new Date();
        var datetime = "" 
            +  currentdate.getFullYear() + "/" 
            + (currentdate.getMonth()+1) + "/" 
            +  currentdate.getDate()     + " @ "
            +  currentdate.getHours()    + ":"
            +  currentdate.getMinutes()  + ":"
            +  currentdate.getSeconds();
        console.log(datetime + "\t-\tReceiving " + file.name);

        fs.rename(file.path, path.join(form.uploadDir, file.name));

    });

    // Chu-Chi: without the following code ... it's not working ... no ideas ...

    var workerProcess2 = child_process.exec('node -v ',
        function (error, stdout, stderr) {
            if (error) {
                // console.log(error.stack);
                // console.log('Error code: '+error.code);
                // console.log('Signal received: '+error.signal);
            }
            // console.log('stdout: ' + stdout);
            // console.log('stderr: ' + stderr);
        });

    workerProcess2.on('exit', function (code) {
        // console.log('Child process exited with exit code '+code);

        form.on('error', function(err) {
            // console.log('error: \n' + err);
        });

        form.on('end', function() {
            res.end('success');
        });

        form.parse(req);

    });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Start Express http server on port 8080
var webServer = http.createServer(httpApp).listen(8080);

// Start Socket.io so it attaches itself to Express server
var socketServer = io.listen(webServer, {"log level":1});

easyrtc.setOption("logLevel", "debug");

// Overriding the default easyrtcAuth listener, only so we can directly access its callback
easyrtc.events.on("easyrtcAuth", function(socket, easyrtcid, msg, socketCallback, callback) {
    easyrtc.events.defaultListeners.easyrtcAuth(socket, easyrtcid, msg, socketCallback, function(err, connectionObj){
        if (err || !msg.msgData || !msg.msgData.credential || !connectionObj) {
            callback(err, connectionObj);
            return;
        }

        connectionObj.setField("credential", msg.msgData.credential, {"isShared":false});

        console.log("["+easyrtcid+"] Credential saved!", connectionObj.getFieldValueSync("credential"));

        callback(err, connectionObj);
    });
});

// To test, lets print the credential to the console for every room join!
easyrtc.events.on("roomJoin", function(connectionObj, roomName, roomParameter, callback) {
    console.log("["+connectionObj.getEasyrtcid()+"] Credential retrieved!", connectionObj.getFieldValueSync("credential"));
    easyrtc.events.defaultListeners.roomJoin(connectionObj, roomName, roomParameter, callback);
});


// Start EasyRTC server
var rtc = easyrtc.listen(httpApp, socketServer, null, function(err, rtcRef) {
    console.log("Initiated");

    rtcRef.events.on("roomCreate", function(appObj, creatorConnectionObj, roomName, roomOptions, callback) {
        console.log("roomCreate fired! Trying to create: " + roomName);

        appObj.events.defaultListeners.roomCreate(appObj, creatorConnectionObj, roomName, roomOptions, callback);
    });
});
